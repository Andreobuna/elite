import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { searchProducts, getProductDetail, applyMarkup } from '../utils/cjdropshipping';
import { env } from '../config/env';
import slugify from '../utils/slugify';
import {
  fallbackCatalogCategories,
  fallbackCatalogProductBySlug,
  fallbackCatalogProducts,
  fallbackMarkupPercent,
  fallbackSettings,
  fallbackStoreCatalog,
  isDatabaseUnavailable,
} from '../utils/dbFallback';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search, sort, page = '1', pageSize = '12' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(pageSize, 10) || 12, 1000);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const where: any = { isActive: true };
    if (category) where.category = { slug: category };
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const orderBy =
      sort === 'price_asc' ? { sellingPrice: 'asc' as const } :
      sort === 'price_desc' ? { sellingPrice: 'desc' as const } :
      sort === 'rating' ? { ratingAverage: 'desc' as const } :
      { createdAt: 'desc' as const };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, orderBy, take, skip,
        include: { images: true, category: true },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: Number(page), pageSize: take });
  } catch (err) {
    if (!isDatabaseUnavailable(err)) {
      return next(err);
    }

    const { category, search, sort, page = '1', pageSize = '12' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(pageSize, 10) || 12, 1000);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;
    const needle = (search || '').trim().toLowerCase();

    let products = fallbackCatalogProducts().filter((product) => {
      if (!product.isActive) return false;
      if (category && product.category?.slug !== category) return false;
      if (needle) {
        const haystack = [product.title, product.description, product.category?.name ?? '', product.category?.slug ?? '']
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      }
      return true;
    });

    products = products.sort((left, right) => {
      if (sort === 'price_asc') return Number(left.sellingPrice) - Number(right.sellingPrice);
      if (sort === 'price_desc') return Number(right.sellingPrice) - Number(left.sellingPrice);
      if (sort === 'rating') return Number(right.ratingAverage) - Number(left.ratingAverage);
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

    res.json({ products: products.slice(skip, skip + take), total: products.length, page: Number(page), pageSize: take });
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { images: true, variants: true, category: true, reviews: { include: { user: true } } },
    });
    if (!product) throw new AppError('Product not found.', 404);

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId ?? undefined, id: { not: product.id }, isActive: true },
      take: 4,
      include: { images: true },
    });

    res.json({ product, related });
  } catch (err) {
    if (!isDatabaseUnavailable(err)) {
      return next(err);
    }

    const product = fallbackCatalogProductBySlug(req.params.slug);
    if (!product) throw new AppError('Product not found.', 404);

    const related = fallbackCatalogProducts()
      .filter((candidate) => candidate.categoryId === product.categoryId && candidate.slug !== product.slug && candidate.isActive)
      .slice(0, 4);

    res.json({ product, related });
  }
}

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ categories });
  } catch (err) {
    if (!isDatabaseUnavailable(err)) {
      return next(err);
    }
    res.json({ categories: fallbackCatalogCategories() });
  }
}

// --- Admin: CJ Dropshipping sync ---
// Pulls products from CJ Dropshipping (or the bundled mock catalog, if no API
// credentials are configured yet) and upserts them with markup applied.
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

      const product = await prisma.product.upsert({
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
      void product;
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

    const markupSetting = fallbackSettings().find((setting) => setting.key === 'MARKUP_PERCENT_DEFAULT');
    const markupPercent = markupSetting ? parseFloat(markupSetting.value) : fallbackMarkupPercent();
    const stored = fallbackStoreCatalog(remoteProducts, markupPercent);

    res.json({
      message: `Database unavailable. Imported ${stored.length} product(s) into the local catalog cache.`,
      synced: stored.length,
      offline: true,
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


