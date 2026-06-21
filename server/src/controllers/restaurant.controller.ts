import { Request, Response } from 'express';
import { RestaurantModel } from '../models/Restaurant.model';
import { UserModel } from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';

// POST /api/restaurants — admin creates their restaurant
export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user!.userId;
  const existing = await RestaurantModel.findOne({ adminId });
  if (existing) { sendError(res, 'You already have a restaurant', 409); return; }

  const restaurant = await RestaurantModel.create({ ...req.body, adminId });
  await UserModel.findByIdAndUpdate(adminId, { restaurantId: restaurant._id });
  sendSuccess(res, restaurant, 201, 'Restaurant created');
});

// GET /api/restaurants/mine — admin gets their own restaurant
export const getMyRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'No restaurant found', 404); return; }
  sendSuccess(res, restaurant);
});

// PUT /api/restaurants/mine — admin updates their restaurant
export const updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOneAndUpdate(
    { adminId: req.user!.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }
  sendSuccess(res, restaurant, 200, 'Updated');
});

// GET /api/restaurants/:id/public — public info for customers
export const getPublicRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findById(req.params.id)
    .select('name address cuisineType dietType opensAt closesAt logo averageRating');
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }
  sendSuccess(res, restaurant);
});
