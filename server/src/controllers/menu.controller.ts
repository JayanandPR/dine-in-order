import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category.model';
import { FoodItemModel } from '../models/FoodItem.model';
import { RestaurantModel } from '../models/Restaurant.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';

// ── CATEGORIES ──────────────────────────────────────────────────────────────

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = req.params.restaurantId;
  const categories = await CategoryModel.find({ restaurantId });
  sendSuccess(res, categories);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }
  const category = await CategoryModel.create({ restaurantId: restaurant._id, name: req.body.name });
  sendSuccess(res, category, 201, 'Category created');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }
  const cat = await CategoryModel.findOneAndDelete({ _id: req.params.id, restaurantId: restaurant._id });
  if (!cat) { sendError(res, 'Category not found', 404); return; }
  await FoodItemModel.deleteMany({ categoryId: cat._id });
  sendSuccess(res, null, 200, 'Category and its items deleted');
});

// ── FOOD ITEMS ───────────────────────────────────────────────────────────────

export const getMenuItems = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = req.params.restaurantId;
  const items = await FoodItemModel.find({ restaurantId }).populate('categoryId', 'name');
  sendSuccess(res, items);
});

export const createFoodItem = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const category = await CategoryModel.findOne({ _id: req.body.categoryId, restaurantId: restaurant._id });
  if (!category) { sendError(res, 'Category not found or does not belong to your restaurant', 404); return; }

  const item = await FoodItemModel.create({ ...req.body, restaurantId: restaurant._id });
  sendSuccess(res, item, 201, 'Food item created');
});

export const updateFoodItem = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const item = await FoodItemModel.findOneAndUpdate(
    { _id: req.params.id, restaurantId: restaurant._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) { sendError(res, 'Food item not found', 404); return; }
  sendSuccess(res, item, 200, 'Updated');
});

export const deleteFoodItem = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const item = await FoodItemModel.findOneAndDelete({ _id: req.params.id, restaurantId: restaurant._id });
  if (!item) { sendError(res, 'Food item not found', 404); return; }
  sendSuccess(res, null, 200, 'Deleted');
});
