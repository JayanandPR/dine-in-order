import { Router } from 'express';
import authRoutes       from './auth.routes';
import restaurantRoutes from './restaurant.routes';
import menuRoutes       from './menu.routes';
import tableRoutes      from './table.routes';
import cartRoutes       from './cart.routes';
import orderRoutes      from './order.routes';
import billRoutes       from './bill.routes';
import staffRoutes      from './staff.routes';
import uploadRoutes     from './upload.routes';
import ratingRoutes     from './rating.routes';
import analyticsRoutes  from './analytics.routes';

const router = Router();

router.use('/auth',        authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menu',        menuRoutes);
router.use('/tables',      tableRoutes);
router.use('/cart',        cartRoutes);
router.use('/orders',      orderRoutes);
router.use('/bills',       billRoutes);
router.use('/staff',       staffRoutes);
router.use('/upload',      uploadRoutes);
router.use('/ratings',     ratingRoutes);
router.use('/analytics',   analyticsRoutes);

export default router;