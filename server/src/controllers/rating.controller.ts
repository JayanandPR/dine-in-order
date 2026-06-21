import { Request, Response } from 'express';
import { RatingModel } from '../models/Rating.model';
import { BillModel } from '../models/Bill.model';
import { RestaurantModel } from '../models/Restaurant.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';

// POST /api/ratings — customer submits rating after paying
export const submitRating = asyncHandler(async (req: Request, res: Response) => {
  const { billId, rating, comment } = req.body;

  const bill = await BillModel.findById(billId);
  if (!bill) { sendError(res, 'Bill not found', 404); return; }
  if (!bill.isPaid) { sendError(res, 'You can only rate after payment', 403); return; }

  const existing = await RatingModel.findOne({ billId });
  if (existing) { sendError(res, 'Already rated', 409); return; }

  const newRating = await RatingModel.create({
    restaurantId: bill.restaurantId,
    tableId:      bill.tableId,
    billId,
    rating,
    comment,
  });

  // Recalculate average rating on restaurant
  const allRatings = await RatingModel.find({ restaurantId: bill.restaurantId });
  const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
  await RestaurantModel.findByIdAndUpdate(bill.restaurantId, { averageRating: Math.round(avg * 10) / 10 });

  sendSuccess(res, newRating, 201, 'Thank you for your feedback!');
});

// GET /api/ratings/:restaurantId — admin views all ratings
export const getRestaurantRatings = asyncHandler(async (req: Request, res: Response) => {
  const ratings = await RatingModel.find({ restaurantId: req.params.restaurantId })
    .sort({ createdAt: -1 });
  sendSuccess(res, ratings);
});