import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as wishlistController from '../controllers/wishlist.controller';

const router = Router();

router.use(requireAuth);
router.get('/', wishlistController.listWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;
