import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export async function listAddresses(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.sub }, orderBy: { isDefault: 'desc' } });
    res.json({ addresses });
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { fullName, line1, line2, city, state, postalCode, country, phone, isDefault } = req.body;
    const address = await prisma.address.create({
      data: { userId: req.user!.sub, fullName, line1, line2, city, state, postalCode, country, phone, isDefault: !!isDefault },
    });
    res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.sub } });
    if (!address) throw new AppError('Address not found.', 404);
    await prisma.address.delete({ where: { id: address.id } });
    res.json({ message: 'Address removed.' });
  } catch (err) {
    next(err);
  }
}
