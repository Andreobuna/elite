import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import * as productsController from '../controllers/products.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/settings', adminController.getSettings);
router.post('/settings/markup', adminController.updateMarkup);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/audit-logs', adminController.listAuditLogs);
router.get('/coupons', adminController.listCoupons);
router.post('/coupons', adminController.createCoupon);
router.post('/products', productsController.createManualProduct);

export default router;
