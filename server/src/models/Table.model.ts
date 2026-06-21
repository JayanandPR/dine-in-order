import mongoose, { Schema, Document } from 'mongoose';

export interface ITableDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableNo: number;
  tableCapacity: number;
  status: 'available' | 'occupied' | 'reserved';
  qrCode?: string; // base64 PNG stored as string, or Cloudinary URL
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITableDocument>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableNo:       { type: Number, required: true },
    tableCapacity: { type: Number, required: true, default: 4 },
    status:        { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
    qrCode:        { type: String },
  },
  { timestamps: true }
);

TableSchema.index({ restaurantId: 1, tableNo: 1 }, { unique: true });

export const TableModel = mongoose.model<ITableDocument>('Table', TableSchema);
