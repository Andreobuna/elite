import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export async function listWishlist(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: { product: { include: { images: true } } },
      orderBy: { addedAt: 'desc' },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { productId } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Product not found.', 404);

    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user!.sub, productId } },
      update: {},
      create: { userId: req.user!.sub, productId },
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.sub, productId: req.params.productId },
    });
    res.json({ message: 'Removed from wishlist.' });
  } catch (err) {
    next(err);
  }
}
