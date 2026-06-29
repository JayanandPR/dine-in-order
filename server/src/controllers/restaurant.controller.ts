import { Request, Response } from 'express';
import { RestaurantModel } from '../models/Restaurant.model';
import { UserModel } from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import QRCode from 'qrcode';
import { TableModel } from '../models/Table.model';

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
  const allowedFields = [
    'name', 'address', 'contactNumber', 'contactEmail',
    'opensAt', 'closesAt', 'dietType', 'cuisineType', 'logo',
    'deliveryEnabled', 'deliveryFee', 'minOrderAmount', 'estimatedDeliveryTime',
  ];
  const updates: any = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const restaurant = await RestaurantModel.findOneAndUpdate(
    { adminId: req.user!.userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }
  sendSuccess(res, restaurant, 200, 'Updated');
});

// GET /api/restaurants/:id/public
export const getPublicRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findById(req.params.id)
    .select('name address cuisineType dietType opensAt closesAt logo averageRating deliveryEnabled deliveryFee minOrderAmount estimatedDeliveryTime');
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }
  sendSuccess(res, restaurant);
});

// POST /api/restaurants/mine/qr — generate general QR for restaurant
export const generateGeneralQR = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const CUSTOMER_BASE_URL = process.env.CUSTOMER_BASE_URL || 'http://localhost:5176';
  const qrUrl = `${CUSTOMER_BASE_URL}/home?restaurant=${restaurant._id}`;
  const qrCode = await QRCode.toDataURL(qrUrl);

  restaurant.generalQrCode = qrCode;
  await restaurant.save();

  sendSuccess(res, { qrCode, url: qrUrl }, 200, 'General QR generated');
});

// GET /api/restaurants/:id/tables/public — get tables for customer table picker
export const getPublicTables = asyncHandler(async (req: Request, res: Response) => {
  const tables = await TableModel.find({ restaurantId: req.params.id })
    .select('tableNo tableCapacity status')
    .sort('tableNo');
  sendSuccess(res, tables);
});

// GET /api/restaurants/all — public listing of all restaurants
export const getAllRestaurants = asyncHandler(async (_req: Request, res: Response) => {
  const restaurants = await RestaurantModel.find()
    .select('name address cuisineType dietType averageRating logo opensAt closesAt deliveryEnabled')
    .sort({ createdAt: -1 });
  sendSuccess(res, restaurants);
});