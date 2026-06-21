import { Router } from 'express';
import { submitRating, getRestaurantRatings } from '../controllers/rating.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/',                    submitRating); // public — customer
router.get('/:restaurantId',        authenticate, authorize('admin'), getRestaurantRatings);

export default router;