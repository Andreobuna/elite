import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthedRequest } from '../middleware/auth';

export async function listNotifications(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.sub },
      data: { isRead: true },
    });
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.sub, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}
