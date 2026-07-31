import { Router } from 'express';
import * as paymentsController from '../controllers/payments.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.post('/paystack/verify', paymentsController.verifyPaystackPayment);

export default router;
