import { Router } from 'express';
import { placeOrder, getRestaurantOrders, getTableOrders, updateOrderStatus } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/',                                placeOrder); // public
router.get('/restaurant/:restaurantId',        authenticate, authorize('admin', 'staff'), getRestaurantOrders);
router.get('/table/:tableId',                  getTableOrders); // public
router.patch('/:id/status',                    authenticate, authorize('admin', 'staff'), updateOrderStatus);

export default router;
