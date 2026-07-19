import { Router } from 'express';
import * as addressesController from '../controllers/addresses.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', addressesController.listAddresses);
router.post('/', addressesController.createAddress);
router.delete('/:id', addressesController.deleteAddress);

export default router;
