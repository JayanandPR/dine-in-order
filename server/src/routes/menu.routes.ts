import { Router } from 'express';
import {
  getCategories, createCategory, deleteCategory,
  getMenuItems, createFoodItem, updateFoodItem, deleteFoodItem,
} from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Categories
router.get('/:restaurantId/categories', getCategories);
router.post('/categories',        authenticate, authorize('admin'), createCategory);
router.delete('/categories/:id',  authenticate, authorize('admin'), deleteCategory);

// Food items
router.get('/:restaurantId/items',  getMenuItems);
router.post('/items',               authenticate, authorize('admin'), createFoodItem);
router.put('/items/:id',            authenticate, authorize('admin'), updateFoodItem);
router.delete('/items/:id',         authenticate, authorize('admin'), deleteFoodItem);

export default router;
