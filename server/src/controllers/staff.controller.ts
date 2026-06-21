import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { RestaurantModel } from '../models/Restaurant.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';

// GET /api/staff — admin gets all staff for their restaurant
export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const staff = await UserModel.find({ restaurantId: restaurant._id, role: 'staff' })
    .select('-password -refreshToken');
  sendSuccess(res, staff);
});

// POST /api/staff — admin creates a staff account
export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const { username, email, password } = req.body;
  const existing = await UserModel.findOne({ email });
  if (existing) { sendError(res, 'Email already in use', 409); return; }

  const staff = await UserModel.create({
    username,
    email,
    password,
    role: 'staff',
    restaurantId: restaurant._id,
  });

  sendSuccess(res, {
    id: staff.id,
    username: staff.username,
    email: staff.email,
    role: staff.role,
  }, 201, 'Staff created');
});

// DELETE /api/staff/:id — admin removes a staff member
export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const staff = await UserModel.findOneAndDelete({
    _id: req.params.id,
    restaurantId: restaurant._id,
    role: 'staff',
  });
  if (!staff) { sendError(res, 'Staff member not found', 404); return; }
  sendSuccess(res, null, 200, 'Staff removed');
});
