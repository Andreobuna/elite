import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { searchProducts, getProductDetail, applyMarkup } from '../utils/cjdropshipping';
import { getDisplayedCjPrice } from '../utils/productPricing';
import { env } from '../config/env';
import slugify from '../utils/slugify';
import { isDatabaseUnavailable } from '../utils/dbFallback';
import { AuthedRequest } from '../middleware/auth';

const MANUAL_PRODUCT_PREFIX = 'MANUAL-';
const SEXUAL_WELLNESS_SLUG = 'sexual-wellness';

function isManualProduct(product: { aliexpressId: string | null }) {
  return Boolean(product.aliexpressId && product.aliexpressId.startsWith(MANUAL_PRODUCT_PREFIX));
}

function mergeCatalog(products: Array<any>) {
  const manual: any[] = [];
  const regular: any[] = [];

  for (const product of products) {
    if (isManualProduct(product)) manual.push(product);
    else regular.push(product);
  }

  return [...manual, ...regular];
}

function toNumber(value: unknown, fallback = 0) {
  const n = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildImageUrl(imageDataUrl?: string, imageUrl?: string) {
  if (imageDataUrl?.trim()) return imageDataUrl.trim();
  if (imageUrl?.trim()) return imageUrl.trim();
  return '';
}

function buildManualProductId() {
  return `${MANUAL_PRODUCT_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function applyVisiblePricing(product: any) {
  if (isManualProduct(product)) return product;
  return { ...product, sellingPrice: getDisplayedCjPrice(product.basePrice, product.aliexpressId), markupPercent: 400 };
}

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search, sort, page = '1', pageSize = '12' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(pageSize, 10) || 12, 1000);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currentPage - 1) * take;

    const where: any = { isActive: true };
    if (category) where.category = { slug: category };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy =
      sort === 'price_asc' ? { sellingPrice: 'asc' as const } :
      sort === 'price_desc' ? { sellingPrice: 'desc' as const } :
      sort === 'rating' ? { ratingAverage: 'desc' as const } :
      { createdAt: 'desc' as const };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: { images: true, category: true },
    });

    const merged = mergeCatalog(products).map(applyVisiblePricing);
    const paged = merged.slice(skip, skip + take);

    res.json({ products: paged, total: merged.length, page: currentPage, pageSize: take });
  } catch (err) {
    if (!isDatabaseUnavailable(err)) {
      return next(err);
    }

    const { page = '1', pageSize = '12' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(pageSize, 10) || 12, 1000);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    res.json({ products: [], total: 0, page: currentPage, pageSize: take });
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, isActive: true },
      include: { images: true, variants: true, category: true, reviews: { include: { user: true } } },
    });
    if (!product) throw new AppError('Product not found.', 404);

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId ?? undefined,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: { images: true },
    });

    res.json({ product: applyVisiblePricing(product), related: related.map(applyVisiblePricing) });
  } catch (err) {
    if (!isDatabaseUnavailable(err)) {
      return next(err);
    }

    return res.status(503).json({ error: 'Catalog temporarily unavailable.' });
  }
}

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: {
            isActive: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ categories });
  } catch (err) {
    if (!isDatabaseUnavailable(err)) {
      return next(err);
    }
    res.json({ categories: [] });
  }
}

export async function syncFromCjDropshipping(req: Request, res: Response, next: NextFunction) {
  const { keyword = '' } = req.body as { keyword?: string };
  const remoteProducts = await searchProducts(keyword);

  try {
    const log = await prisma.aliExpressSyncLog.create({ data: { status: 'PARTIAL', itemsSynced: 0 } });
    const markupSetting = await prisma.setting.findUnique({ where: { key: 'MARKUP_PERCENT_DEFAULT' } });
    const markupPercent = markupSetting ? parseFloat(markupSetting.value) : env.defaultMarkupPercent;

    let synced = 0;
    for (const rp of remoteProducts) {
      const sellingPrice = applyMarkup(rp.basePrice, markupPercent);

      let category = await prisma.category.findUnique({ where: { name: rp.category } });
      if (!category) {
        category = await prisma.category.create({
          data: { name: rp.category, slug: slugify(rp.category) },
        });
      }

      const cjProductId = rp.cjProductId;
      const slug = slugify(rp.title) + '-' + cjProductId.slice(-4);

      await prisma.product.upsert({
        where: { aliexpressId: cjProductId },
        update: {
          title: rp.title,
          description: rp.description,
          basePrice: rp.basePrice,
          markupPercent,
          sellingPrice,
          stock: rp.stock,
          ratingAverage: rp.ratingAverage,
          ratingCount: rp.ratingCount,
          categoryId: category.id,
          images: {
            deleteMany: {},
            create: rp.images.map((url: string, i: number) => ({ url, position: i })),
          },
          variants: {
            deleteMany: {},
            create: rp.variants.map((v: any) => ({
              sku: v.sku,
              name: v.name,
              priceDelta: v.priceDelta,
              stock: v.stock,
              attributes: v.attributes,
            })),
          },
        },
        create: {
          aliexpressId: cjProductId,
          title: rp.title,
          slug,
          description: rp.description,
          basePrice: rp.basePrice,
          markupPercent,
          sellingPrice,
          stock: rp.stock,
          ratingAverage: rp.ratingAverage,
          ratingCount: rp.ratingCount,
          categoryId: category.id,
          images: { create: rp.images.map((url: string, i: number) => ({ url, position: i })) },
          variants: {
            create: rp.variants.map((v: any) => ({
              sku: v.sku,
              name: v.name,
              priceDelta: v.priceDelta,
              stock: v.stock,
              attributes: v.attributes,
            })),
          },
        },
      });

      synced += 1;
    }

    await prisma.aliExpressSyncLog.update({
      where: { id: log.id },
      data: { itemsSynced: synced, finishedAt: new Date(), status: 'SUCCESS' },
    });

    res.json({ message: `Synced ${synced} product(s) from CJ Dropshipping.`, synced });
  } catch (err) {
    if (!isDatabaseUnavailable(err)) {
      return next(err);
    }

    return res.status(503).json({
      error: 'Database unavailable. CJ products were not stored.',
      synced: 0,
    });
  }
}

export async function createManualProduct(req: AuthedRequest, res: Response, next: NextFunction) {
  const { name, price, stock, description, discountPercent, imageDataUrl, imageUrl } = req.body as {
    name?: string;
    price?: string | number;
    stock?: string | number;
    description?: string;
    discountPercent?: string | number;
    imageDataUrl?: string;
    imageUrl?: string;
  };

  try {
    const title = String(name ?? '').trim();
    const writeUp = String(description ?? '').trim();
    const numericPrice = toNumber(price, NaN);
    const numericStock = Math.max(0, Math.floor(toNumber(stock, 0)));
    const numericDiscount = Math.min(100, Math.max(0, toNumber(discountPercent, 0)));
    const resolvedImage = buildImageUrl(imageDataUrl, imageUrl);

    if (!title) throw new AppError('Product name is required.');
    if (!writeUp) throw new AppError('Product description is required.');
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) throw new AppError('Product price must be greater than zero.');
    if (!resolvedImage) throw new AppError('Product image is required.');

    const category = await prisma.category.upsert({
      where: { slug: SEXUAL_WELLNESS_SLUG },
      update: {},
      create: { name: 'Sexual Wellness', slug: SEXUAL_WELLNESS_SLUG },
    });

    const basePrice = Math.round(numericPrice * 100) / 100;
    const sellingPrice = Math.max(0, Math.round(basePrice * (1 - numericDiscount / 100) * 100) / 100);
    const aliexpressId = buildManualProductId();
    const slug = `${slugify(title)}-${aliexpressId.slice(-6)}`;

    const product = await prisma.product.create({
      data: {
        aliexpressId,
        title,
        slug,
        description: writeUp,
        basePrice,
        markupPercent: 0,
        sellingPrice,
        currency: 'NGN',
        stock: numericStock,
        ratingAverage: 0,
        ratingCount: 0,
        categoryId: category.id,
        images: {
          create: [{ url: resolvedImage, position: 0 }],
        },
      },
      include: { images: true, category: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.sub,
        action: 'CREATE_MANUAL_PRODUCT',
        entity: 'Product',
        entityId: product.id,
        metadata: {
          title,
          price: basePrice,
          sellingPrice,
          stock: numericStock,
          discountPercent: numericDiscount,
        },
      },
    });

    res.status(201).json({ product, message: 'Manual product created successfully.' });
  } catch (err) {
    if (!isDatabaseUnavailable(err)) {
      return next(err);
    }

    return res.status(201).json({
      product: {
        id: `offline-${Date.now()}`,
        aliexpressId: buildManualProductId(),
        title: name,
        slug: slugify(String(name ?? 'product')),
        description,
        basePrice: toNumber(price, 0),
        markupPercent: 0,
        sellingPrice: Math.max(0, Math.round(toNumber(price, 0) * (1 - toNumber(discountPercent, 0) / 100) * 100) / 100),
        currency: 'NGN',
        stock: Math.max(0, Math.floor(toNumber(stock, 0))),
        ratingAverage: 0,
        ratingCount: 0,
        categoryId: null,
        category: { id: 'offline-sexual-wellness', name: 'Sexual Wellness', slug: SEXUAL_WELLNESS_SLUG },
        images: [{ id: `offline-${Date.now()}-image`, productId: `offline-${Date.now()}`, url: imageDataUrl || imageUrl || '', altText: null, position: 0 }],
      },
      message: 'Manual product created in offline mode.',
    });
  }
}

export async function getProductDetailPreview(req: Request, res: Response, next: NextFunction) {
  try {
    const detail = await getProductDetail(req.params.cjProductId);
    if (!detail) throw new AppError('Product not found on CJ Dropshipping.', 404);
    res.json({ product: detail });
  } catch (err) {
    next(err);
  }
}
