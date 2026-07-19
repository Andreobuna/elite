import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as notificationsController from '../controllers/notifications.controller';

const router = Router();
router.use(requireAuth);

router.get('/', notificationsController.listNotifications);
router.patch('/:id/read', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);

export default router;
