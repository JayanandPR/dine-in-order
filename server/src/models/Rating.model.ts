import mongoose, { Schema, Document } from 'mongoose';

export interface IRatingDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  billId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const RatingSchema = new Schema<IRatingDocument>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableId:      { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    billId:       { type: Schema.Types.ObjectId, ref: 'Bill', required: true, unique: true },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    comment:      { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

export const RatingModel = mongoose.model<IRatingDocument>('Rating', RatingSchema);