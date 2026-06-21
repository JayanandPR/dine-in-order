import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItemDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  foodItemId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  isOrdered: boolean;
}

const CartItemSchema = new Schema<ICartItemDocument>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableId:      { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    foodItemId:   { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    quantity:     { type: Number, required: true, min: 1 },
    totalPrice:   { type: Number, required: true },
    isOrdered:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CartItemModel = mongoose.model<ICartItemDocument>('CartItem', CartItemSchema);
