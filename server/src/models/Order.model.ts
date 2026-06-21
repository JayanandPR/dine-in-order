import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

interface OrderItem {
  foodItemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrderDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  orderedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableId:      { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    items: [
      {
        foodItemId: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
        name:       { type: String, required: true },
        quantity:   { type: Number, required: true },
        price:      { type: Number, required: true },
      },
    ],
    status:      { type: String, enum: ['pending','preparing','ready','served','cancelled'], default: 'pending' },
    totalAmount: { type: Number, required: true },
    orderedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrderDocument>('Order', OrderSchema);
