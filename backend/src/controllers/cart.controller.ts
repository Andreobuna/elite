import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthedRequest } from '../middleware/auth';

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });
  return cart;
}

export async function getCart(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const cart = await getOrCreateCart(req.user!.sub);
    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: { include: { images: true } }, variant: true },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const cart = await getOrCreateCart(req.user!.sub);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Product not found.', 404);

    const item = await prisma.cartItem.upsert({
      where: { cartId_productId_variantId: { cartId: cart.id, productId, variantId: variantId ?? null } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, variantId: variantId ?? null, quantity },
    });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { quantity } = req.body;
    if (quantity < 1) throw new AppError('Quantity must be at least 1.', 400);

    const item = await prisma.cartItem.update({
      where: { id: req.params.itemId },
      data: { quantity },
    });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    next(err);
  }
}
