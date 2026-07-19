import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.post('/', ordersController.createOrder);
router.get('/', ordersController.listMyOrders);
router.get('/:id', ordersController.getOrderById);
router.patch('/:id/status', requireRole('ADMIN'), ordersController.updateOrderStatus);

export default router;
