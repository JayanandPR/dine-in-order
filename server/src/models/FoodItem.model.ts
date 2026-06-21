import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodItemDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  description: string;
  stock: number;
  availability: boolean;
  dietType: 'veg' | 'non-veg' | 'vegan';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FoodItemSchema = new Schema<IFoodItemDocument>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    categoryId:   { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name:         { type: String, required: true, trim: true },
    price:        { type: Number, required: true, min: 0 },
    description:  { type: String, default: '' },
    stock:        { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    dietType:     { type: String, enum: ['veg', 'non-veg', 'vegan'], default: 'veg' },
    image:        { type: String },
  },
  { timestamps: true }
);

export const FoodItemModel = mongoose.model<IFoodItemDocument>('FoodItem', FoodItemSchema);
