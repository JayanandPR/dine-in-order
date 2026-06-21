import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { TableModel } from '../models/Table.model';
import { RestaurantModel } from '../models/Restaurant.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { broadcastToRestaurant } from '../utils/websocket';
import { CartItemModel } from '../models/CartItem.model';
import { OrderModel } from '../models/Order.model';
import { BillModel } from '../models/Bill.model';


const CUSTOMER_BASE_URL = process.env.CUSTOMER_BASE_URL || 'http://localhost:5176';

// GET /api/tables/:restaurantId — get all tables for a restaurant
export const getTables = asyncHandler(async (req: Request, res: Response) => {
  const tables = await TableModel.find({ restaurantId: req.params.restaurantId }).sort('tableNo');
  sendSuccess(res, tables);
});

// POST /api/tables — admin creates a table + generates QR
export const createTable = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const { tableNo, tableCapacity } = req.body;
  const existing = await TableModel.findOne({ restaurantId: restaurant._id, tableNo });
  if (existing) { sendError(res, `Table ${tableNo} already exists`, 409); return; }

  const table = await TableModel.create({ restaurantId: restaurant._id, tableNo, tableCapacity });

  // Generate QR code pointing to customer app
  const qrUrl = `${CUSTOMER_BASE_URL}/menu?restaurant=${restaurant._id}&table=${table._id}`;
  const qrCode = await QRCode.toDataURL(qrUrl);
  table.qrCode = qrCode;
  await table.save();

  // Update table count on restaurant
  await RestaurantModel.findByIdAndUpdate(restaurant._id, { $inc: { noOfTables: 1 } });

  sendSuccess(res, table, 201, 'Table created');
});

// PATCH /api/tables/:id/status — staff/admin update table status
export const updateTableStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const table = await TableModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!table) { sendError(res, 'Table not found', 404); return; }

  broadcastToRestaurant(table.restaurantId.toString(), {
    event: 'table:status_update',
    restaurantId: table.restaurantId.toString(),
    payload: { tableId: table._id, tableNo: table.tableNo, status },
  });

  sendSuccess(res, table, 200, 'Table status updated');
});

// DELETE /api/tables/:id — admin deletes a table
export const deleteTable = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantModel.findOne({ adminId: req.user!.userId });
  if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }

  const table = await TableModel.findOneAndDelete({ _id: req.params.id, restaurantId: restaurant._id });
  if (!table) { sendError(res, 'Table not found', 404); return; }

  await RestaurantModel.findByIdAndUpdate(restaurant._id, { $inc: { noOfTables: -1 } });
  sendSuccess(res, null, 200, 'Table deleted');
});

// GET /api/tables/:tableId/session — check if table has active cart/orders
export const getTableSession = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;

  const table = await TableModel.findById(tableId);
  if (!table) { sendError(res, 'Table not found', 404); return; }

  const [cartItems, activeOrders, bill] = await Promise.all([
    CartItemModel.find({ tableId, isOrdered: false }),
    OrderModel.find({ tableId, status: { $nin: ['served', 'cancelled'] } }),
    BillModel.findOne({ tableId, isPaid: false }),
  ]);

  sendSuccess(res, {
    table,
    hasCart: cartItems.length > 0,
    cartCount: cartItems.length,
    hasActiveOrders: activeOrders.length > 0,
    hasBill: !!bill,
    billId: bill?._id,
  });
});
