import { Router } from 'express';
import { createRestaurant, getMyRestaurant, updateRestaurant, getPublicRestaurant } from '../controllers/restaurant.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id/public', getPublicRestaurant);
router.post('/',      authenticate, authorize('admin'), createRestaurant);
router.get('/mine',   authenticate, authorize('admin'), getMyRestaurant);
router.put('/mine',   authenticate, authorize('admin'), updateRestaurant);

export default router;
