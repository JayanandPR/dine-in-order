import { Router } from 'express';
import {
  createRestaurant, getMyRestaurant, updateRestaurant,
  getPublicRestaurant, generateGeneralQR, getPublicTables,
} from '../controllers/restaurant.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id/public',         getPublicRestaurant);
router.get('/:id/tables/public',  getPublicTables);
router.post('/',                  authenticate, authorize('admin'), createRestaurant);
router.get('/mine',               authenticate, authorize('admin'), getMyRestaurant);
router.put('/mine',               authenticate, authorize('admin'), updateRestaurant);
router.post('/mine/qr',           authenticate, authorize('admin'), generateGeneralQR);

export default router;
