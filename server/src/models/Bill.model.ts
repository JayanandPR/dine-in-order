import mongoose, { Schema, Document } from 'mongoose';

export interface IBillDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  totalPayableAmount: number;
  isPaid: boolean;
  paymentId?: string;
  generatedAt: Date;
}

const BillSchema = new Schema<IBillDocument>(
  {
    restaurantId:       { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableId:            { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    orderId:            { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    totalPayableAmount: { type: Number, required: true },
    isPaid:             { type: Boolean, default: false },
    paymentId:          { type: String },
    generatedAt:        { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const BillModel = mongoose.model<IBillDocument>('Bill', BillSchema);
