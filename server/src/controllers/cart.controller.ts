import { Request, Response } from 'express';
import { CartItemModel } from '../models/CartItem.model';
import { FoodItemModel } from '../models/FoodItem.model';
import { TableModel } from '../models/Table.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';

// GET /api/cart/:tableId
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const items = await CartItemModel.find({ tableId: req.params.tableId, isOrdered: false })
    .populate('foodItemId', 'name price image dietType');
  sendSuccess(res, items);
});

// POST /api/cart — add item to cart
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { tableId, foodItemId, quantity } = req.body;

  const table = await TableModel.findById(tableId);
  if (!table) { sendError(res, 'Table not found', 404); return; }

  const food = await FoodItemModel.findOne({ _id: foodItemId, availability: true });
  if (!food) { sendError(res, 'Food item not available', 404); return; }
  if (food.stock < quantity) { sendError(res, 'Insufficient stock', 400); return; }

  // If item already in cart, increment quantity
  const existing = await CartItemModel.findOne({ tableId, foodItemId, isOrdered: false });
  if (existing) {
    existing.quantity += quantity;
    existing.totalPrice = existing.quantity * food.price;
    await existing.save();
    sendSuccess(res, existing, 200, 'Cart updated');
    return;
  }

  const cartItem = await CartItemModel.create({
    restaurantId: table.restaurantId,
    tableId,
    foodItemId,
    quantity,
    totalPrice: food.price * quantity,
  });
  sendSuccess(res, cartItem, 201, 'Added to cart');
});

// PATCH /api/cart/:id — update quantity
export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const cartItem = await CartItemModel.findById(req.params.id).populate<{ foodItemId: any }>('foodItemId');
  if (!cartItem || cartItem.isOrdered) { sendError(res, 'Cart item not found', 404); return; }

  if (quantity <= 0) {
    await cartItem.deleteOne();
    sendSuccess(res, null, 200, 'Item removed');
    return;
  }

  cartItem.quantity = quantity;
  cartItem.totalPrice = cartItem.foodItemId.price * quantity;
  await cartItem.save();
  sendSuccess(res, cartItem, 200, 'Updated');
});

// DELETE /api/cart/:id
export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  await CartItemModel.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 200, 'Removed');
});

// DELETE /api/cart/clear/:tableId — clear entire cart for a table
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await CartItemModel.deleteMany({ tableId: req.params.tableId, isOrdered: false });
  sendSuccess(res, null, 200, 'Cart cleared');
});
