import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, getDeliveryCart } from '../controllers/cart.controller';

const router = Router();

// Cart is public — accessed by customers via tableId (no auth token needed)
router.get('/:tableId',         getCart);
router.post('/',                addToCart);
router.patch('/:id',            updateCartItem);
router.delete('/clear/:tableId', clearCart);
router.delete('/:id',           removeCartItem);
router.get('/delivery/:restaurantId', getDeliveryCart);


export default router;
