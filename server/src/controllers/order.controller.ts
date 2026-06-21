import { Request, Response } from 'express';
import { OrderModel } from '../models/Order.model';
import { CartItemModel } from '../models/CartItem.model';
import { FoodItemModel } from '../models/FoodItem.model';
import { TableModel } from '../models/Table.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { broadcastToRestaurant } from '../utils/websocket';

// POST /api/orders — customer places order from cart
export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.body;

  const table = await TableModel.findById(tableId);
  if (!table) { sendError(res, 'Table not found', 404); return; }

  const cartItems = await CartItemModel.find({ tableId, isOrdered: false })
    .populate<{ foodItemId: any }>('foodItemId');

  if (!cartItems.length) { sendError(res, 'Cart is empty', 400); return; }

  const orderItems = cartItems.map(ci => ({
    foodItemId: ci.foodItemId._id,
    name:       ci.foodItemId.name,
    quantity:   ci.quantity,
    price:      ci.foodItemId.price,
  }));

  const totalAmount = cartItems.reduce((sum, ci) => sum + ci.totalPrice, 0);

  const order = await OrderModel.create({
    restaurantId: table.restaurantId,
    tableId,
    items: orderItems,
    totalAmount,
  });

  // Mark cart items as ordered & decrement stock
  for (const ci of cartItems) {
    ci.isOrdered = true;
    await ci.save();
    await FoodItemModel.findByIdAndUpdate(ci.foodItemId._id, { $inc: { stock: -ci.quantity } });
  }

  // Mark table as occupied
  await TableModel.findByIdAndUpdate(tableId, { status: 'occupied' });

  // Broadcast new order to staff/admin WebSocket room
  broadcastToRestaurant(table.restaurantId.toString(), {
    event: 'order:new',
    restaurantId: table.restaurantId.toString(),
    payload: order,
  });

  sendSuccess(res, order, 201, 'Order placed');
});

// GET /api/orders/restaurant/:restaurantId — admin/staff get all orders
export const getRestaurantOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const filter: any = { restaurantId: req.params.restaurantId };
  if (status) filter.status = status;

  const orders = await OrderModel.find(filter)
    .populate('tableId', 'tableNo')
    .sort({ orderedAt: -1 });
  sendSuccess(res, orders);
});

// GET /api/orders/table/:tableId — customer views their table's orders
export const getTableOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await OrderModel.find({ tableId: req.params.tableId }).sort({ orderedAt: -1 });
  sendSuccess(res, orders);
});

// PATCH /api/orders/:id/status — staff updates order status
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const order = await OrderModel.findByIdAndUpdate(req.params.id, { status }, { new: true })
    .populate('tableId', 'tableNo');
  if (!order) { sendError(res, 'Order not found', 404); return; }

  broadcastToRestaurant(order.restaurantId.toString(), {
    event: 'order:status_update',
    restaurantId: order.restaurantId.toString(),
    payload: { orderId: order._id, status, tableId: order.tableId },
  });

  sendSuccess(res, order, 200, 'Status updated');
});
