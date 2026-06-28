import { Router } from 'express';
import {
  placeOrder, getRestaurantOrders, getDeliveryOrders,
  getTableOrders, trackOrder, updateOrderStatus, updateDeliveryStatus,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/',                                    placeOrder); // public
router.get('/restaurant/:restaurantId',             authenticate, authorize('admin', 'staff'), getRestaurantOrders);
router.get('/delivery/:restaurantId',               authenticate, authorize('admin', 'staff'), getDeliveryOrders);
router.get('/table/:tableId',                       getTableOrders); // public
router.get('/track/:orderId',                       trackOrder); // public
router.patch('/:id/status',                         authenticate, authorize('admin', 'staff'), updateOrderStatus);
router.patch('/:id/delivery-status',                authenticate, authorize('admin', 'staff'), updateDeliveryStatus);

export default router;