import { Request, Response } from 'express';
import { OrderModel } from '../models/Order.model';
import { CartItemModel } from '../models/CartItem.model';
import { FoodItemModel } from '../models/FoodItem.model';
import { TableModel } from '../models/Table.model';
import { RestaurantModel } from '../models/Restaurant.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { broadcastToRestaurant } from '../utils/websocket';

// POST /api/orders — place order from cart (dine-in or delivery)
export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const { tableId, orderType = 'dine-in', deliveryDetails, restaurantId: bodyRestaurantId } = req.body;

  let restaurantId = bodyRestaurantId;

  // For dine-in, get restaurantId from table
  if (orderType === 'dine-in') {
    if (!tableId) { sendError(res, 'tableId required for dine-in orders', 400); return; }
    const table = await TableModel.findById(tableId);
    if (!table) { sendError(res, 'Table not found', 404); return; }
    restaurantId = table.restaurantId.toString();
  }

  // For delivery, validate delivery details
  if (orderType === 'delivery') {
    if (!restaurantId) { sendError(res, 'restaurantId required for delivery orders', 400); return; }
    if (!deliveryDetails?.address || !deliveryDetails?.phone) {
      sendError(res, 'Address and phone are required for delivery', 400);
      return;
    }
    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) { sendError(res, 'Restaurant not found', 404); return; }
    if (!restaurant.deliveryEnabled) { sendError(res, 'This restaurant does not offer delivery', 400); return; }
  }

  // Fetch cart items
  const cartQuery: any = { restaurantId, isOrdered: false };
  if (orderType === 'dine-in') cartQuery.tableId = tableId;
  else cartQuery.orderType = 'delivery';

  const cartItems = await CartItemModel.find(cartQuery)
    .populate<{ foodItemId: any }>('foodItemId');

  if (!cartItems.length) { sendError(res, 'Cart is empty', 400); return; }

  const orderItems = cartItems.map(ci => ({
    foodItemId: ci.foodItemId._id,
    name:       ci.foodItemId.name,
    quantity:   ci.quantity,
    price:      ci.foodItemId.price,
  }));

  const subtotal = cartItems.reduce((sum, ci) => sum + ci.totalPrice, 0);

  // Get delivery fee from restaurant if delivery order
  let deliveryFee = 0;
  if (orderType === 'delivery') {
    const restaurant = await RestaurantModel.findById(restaurantId);
    deliveryFee = restaurant?.deliveryFee || 0;

    if (restaurant?.minOrderAmount && subtotal < restaurant.minOrderAmount) {
      sendError(res, `Minimum order amount is ₹${restaurant.minOrderAmount}`, 400);
      return;
    }
  }

  const order = await OrderModel.create({
    restaurantId,
    tableId: orderType === 'dine-in' ? tableId : undefined,
    orderType,
    deliveryDetails: orderType === 'delivery' ? {
      ...deliveryDetails,
      status: 'placed',
      estimatedTime: (await RestaurantModel.findById(restaurantId))?.estimatedDeliveryTime || 30,
    } : undefined,
    items: orderItems,
    totalAmount: subtotal + deliveryFee,
    deliveryFee,
    status: 'pending',
  });

  // Mark cart items as ordered and decrement stock
  for (const ci of cartItems) {
    ci.isOrdered = true;
    await ci.save();
    await FoodItemModel.findByIdAndUpdate(ci.foodItemId._id, { $inc: { stock: -ci.quantity } });
  }

  // For dine-in, mark table as occupied
  if (orderType === 'dine-in' && tableId) {
    await TableModel.findByIdAndUpdate(tableId, { status: 'occupied' });
  }

  // Broadcast new order to staff/admin
  broadcastToRestaurant(restaurantId, {
    event: 'order:new',
    restaurantId,
    payload: order,
  });

  sendSuccess(res, order, 201, 'Order placed');
});

// GET /api/orders/restaurant/:restaurantId — admin/staff get all orders
export const getRestaurantOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, orderType } = req.query;
  const filter: any = { restaurantId: req.params.restaurantId };
  if (status) filter.status = status;
  if (orderType) filter.orderType = orderType;

  const orders = await OrderModel.find(filter)
    .populate('tableId', 'tableNo')
    .sort({ orderedAt: -1 });
  sendSuccess(res, orders);
});

// GET /api/orders/delivery/:restaurantId — get only delivery orders
export const getDeliveryOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const filter: any = { restaurantId: req.params.restaurantId, orderType: 'delivery' };
  if (status) filter['deliveryDetails.status'] = status;

  const orders = await OrderModel.find(filter).sort({ orderedAt: -1 });
  sendSuccess(res, orders);
});

// GET /api/orders/table/:tableId — customer views their table orders
export const getTableOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await OrderModel.find({ tableId: req.params.tableId }).sort({ orderedAt: -1 });
  sendSuccess(res, orders);
});

// GET /api/orders/track/:orderId — customer tracks delivery order
export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await OrderModel.findById(req.params.orderId)
    .select('orderType status deliveryDetails totalAmount deliveryFee items orderedAt restaurantId')
    .populate('restaurantId', 'name address contactNumber');
  if (!order) { sendError(res, 'Order not found', 404); return; }
  sendSuccess(res, order);
});

// PATCH /api/orders/:id/status — staff updates dine-in order status
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

// PATCH /api/orders/:id/delivery-status — staff updates delivery status
export const updateDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  const order = await OrderModel.findByIdAndUpdate(
    req.params.id,
    {
      'deliveryDetails.status': status,
      // Also sync the main status field
      status: status === 'delivered' ? 'served'
            : status === 'cancelled' ? 'cancelled'
            : status === 'preparing' ? 'preparing'
            : 'pending',
    },
    { new: true }
  );

  if (!order) { sendError(res, 'Order not found', 404); return; }

  broadcastToRestaurant(order.restaurantId.toString(), {
    event: 'delivery:status_update',
    restaurantId: order.restaurantId.toString(),
    payload: { orderId: order._id, status, deliveryDetails: order.deliveryDetails },
  });

  sendSuccess(res, order, 200, 'Delivery status updated');
});