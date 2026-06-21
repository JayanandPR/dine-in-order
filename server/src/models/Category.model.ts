import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name:         { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

CategorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

export const CategoryModel = mongoose.model<ICategoryDocument>('Category', CategorySchema);
