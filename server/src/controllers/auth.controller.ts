import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { RestaurantModel } from '../models/Restaurant.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, role } = req.body;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    sendError(res, 'Email already in use', 409);
    return;
  }

  const user = await UserModel.create({ username, email, password, role: role || 'customer' });

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  sendSuccess(res, {
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    tokens: { accessToken, refreshToken },
  }, 201, 'Registered successfully');
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    sendError(res, 'Invalid email or password', 401);
    return;
  }

  const payload = {
    userId: user.id,
    role: user.role,
    restaurantId: user.restaurantId?.toString(),
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  sendSuccess(res, {
    user: { id: user.id, username: user.username, email: user.email, role: user.role, photo: user.photo },
    tokens: { accessToken, refreshToken },
  }, 200, 'Logged in successfully');
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    sendError(res, 'Refresh token required', 400);
    return;
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    sendError(res, 'Invalid refresh token', 401);
    return;
  }

  const user = await UserModel.findById(payload.userId).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    sendError(res, 'Refresh token mismatch', 401);
    return;
  }

  const newPayload = { userId: user.id, role: user.role, restaurantId: user.restaurantId?.toString() };
  const accessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  user.refreshToken = newRefreshToken;
  await user.save();

  sendSuccess(res, { accessToken, refreshToken: newRefreshToken });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (userId) {
    await UserModel.findByIdAndUpdate(userId, { refreshToken: null });
  }
  sendSuccess(res, null, 200, 'Logged out');
});

// GET /api/auth/me
export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) { sendError(res, 'User not found', 404); return; }

  let restaurant = null;
  if (user.restaurantId) {
    restaurant = await RestaurantModel.findById(user.restaurantId).select('-adminId');
  }

  sendSuccess(res, {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      photo: user.photo,
      restaurantId: user.restaurantId?.toString(),
    },
    restaurant,
  });
});

// PATCH /api/auth/change-password
export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  const user = await UserModel.findById(req.user!.userId).select('+password');
  if (!user) { sendError(res, 'User not found', 404); return; }

  const valid = await user.comparePassword(currentPassword);
  if (!valid) { sendError(res, 'Current password is incorrect', 401); return; }

  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, 200, 'Password updated');
});
