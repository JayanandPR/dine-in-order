import { Router } from 'express';
import {
  generateBill, getTableBill, createPaymentOrder,
  verifyPayment, getRestaurantBills,
} from '../controllers/bill.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/',                              authenticate, authorize('admin', 'staff'), generateBill);
router.get('/table/:tableId',                 getTableBill); // public
router.post('/create-payment',               createPaymentOrder); // public
router.post('/verify-payment',               verifyPayment); // public
router.get('/restaurant/:restaurantId',       authenticate, authorize('admin'), getRestaurantBills);

export default router;
