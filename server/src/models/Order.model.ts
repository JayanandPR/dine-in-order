import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type DeliveryStatus = 'placed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type OrderType = 'dine-in' | 'delivery';

interface OrderItem {
  foodItemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

interface DeliveryDetails {
  address: string;
  phone: string;
  note?: string;
  status: DeliveryStatus;
  estimatedTime?: number;
}

export interface IOrderDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId?: mongoose.Types.ObjectId;
  orderType: OrderType;
  deliveryDetails?: DeliveryDetails;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  orderedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableId:      { type: Schema.Types.ObjectId, ref: 'Table' },
    orderType:    { type: String, enum: ['dine-in', 'delivery'], default: 'dine-in' },
    deliveryDetails: {
      address:       { type: String },
      phone:         { type: String },
      note:          { type: String },
      status:        { type: String, enum: ['placed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'], default: 'placed' },
      estimatedTime: { type: Number },
    },
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
    deliveryFee: { type: Number, default: 0 },
    orderedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrderDocument>('Order', OrderSchema);