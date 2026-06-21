import { Request, Response } from 'express';
import { OrderModel } from '../models/Order.model';
import { BillModel } from '../models/Bill.model';
import { RestaurantModel } from '../models/Restaurant.model';
import { RatingModel } from '../models/Rating.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const rid = restaurant._id;

  // Revenue last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyRevenue = await BillModel.aggregate([
    { $match: { restaurantId: rid, isPaid: true, generatedAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$generatedAt' } },
        revenue: { $sum: '$totalPayableAmount' },
        count:   { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Popular items (top 5)
  const popularItems = await OrderModel.aggregate([
    { $match: { restaurantId: rid } },
    { $unwind: '$items' },
    {
      $group: {
        _id:      '$items.name',
        totalQty: { $sum: '$items.quantity' },
        revenue:  { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: 5 },
  ]);

  // Orders by status
  const ordersByStatus = await OrderModel.aggregate([
    { $match: { restaurantId: rid } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Summary totals
  const [totalRevenue, totalOrders, avgRating] = await Promise.all([
    BillModel.aggregate([
      { $match: { restaurantId: rid, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPayableAmount' } } },
    ]),
    OrderModel.countDocuments({ restaurantId: rid }),
    RatingModel.aggregate([
      { $match: { restaurantId: rid } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]),
  ]);

  sendSuccess(res, {
    summary: {
      totalRevenue:  totalRevenue[0]?.total || 0,
      totalOrders,
      averageRating: avgRating[0]?.avg ? Math.round(avgRating[0].avg * 10) / 10 : 0,
    },
    dailyRevenue,
    popularItems,
    ordersByStatus,
  });
});