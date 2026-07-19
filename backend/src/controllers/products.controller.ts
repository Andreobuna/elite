import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { searchProducts, getProductDetail, applyMarkup } from '../utils/cjdropshipping';
import { env } from '../config/env';
import slugify from '../utils/slugify';
import { isDatabaseUnavailable } from '../utils/dbFallback';

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
    next(err);
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
    next(err);
  }
}

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

// --- Admin: AliExpress sync ---
// Pulls products from AliExpress (or the bundled mock catalog, if no API
// credentials are configured yet) and upserts them with markup applied.
export async function syncFromCjDropshipping(req: Request, res: Response, next: NextFunction) {
  const log = await prisma.aliExpressSyncLog.create({ data: { status: 'PARTIAL', itemsSynced: 0 } });
  let remoteProducts: Awaited<ReturnType<typeof searchProducts>> = [];
  try {
    const { keyword = '' } = req.body as { keyword?: string };
    remoteProducts = await searchProducts(keyword);

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

      const slug = slugify(rp.title) + '-' + rp.aliexpressId.slice(-4);

      const product = await prisma.product.upsert({
        where: { aliexpressId: rp.aliexpressId },
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
            create: rp.images.map((url, i) => ({ url, position: i })),
          },
          variants: {
            deleteMany: {},
            create: rp.variants.map((v) => ({
              sku: v.sku,
              name: v.name,
              priceDelta: v.priceDelta,
              stock: v.stock,
              attributes: v.attributes,
            })),
          },
        },
        create: {
          aliexpressId: rp.aliexpressId,
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
          images: { create: rp.images.map((url, i) => ({ url, position: i })) },
          variants: {
            create: rp.variants.map((v) => ({
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

    res.json({ message: `Synced ${synced} product(s) from AliExpress.`, synced });
  } catch (err) {
    if (!isDatabaseUnavailable(err)) {
      await prisma.aliExpressSyncLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', message: (err as Error).message, finishedAt: new Date() },
      });
      return next(err);
    }

    await prisma.aliExpressSyncLog.update({
      where: { id: log.id },
      data: { status: 'SUCCESS', itemsSynced: remoteProducts.length, finishedAt: new Date(), message: 'Offline mode sync preview.' },
    });

    res.json({
      message: `Database unavailable. Previewed ${remoteProducts.length} AliExpress product(s) in offline mode.`,
      synced: remoteProducts.length,
      offline: true,
    });
  }
}

export async function getProductDetailPreview(req: Request, res: Response, next: NextFunction) {
  try {
    const detail = await getProductDetail(req.params.cjProductId);
    if (!detail) throw new AppError('Product not found on AliExpress.', 404);
    res.json({ product: detail });
  } catch (err) {
    next(err);
  }
}
