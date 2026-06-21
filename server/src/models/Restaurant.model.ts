import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurantDocument extends Document {
  adminId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  contactNumber: string;
  contactEmail: string;
  opensAt: string;
  closesAt: string;
  dietType: 'veg' | 'non-veg' | 'both';
  cuisineType: string;
  averageRating: number;
  noOfTables: number;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurantDocument>(
  {
    adminId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:          { type: String, required: true, trim: true },
    address:       { type: String, required: true },
    contactNumber: { type: String, required: true },
    contactEmail:  { type: String, required: true, lowercase: true },
    opensAt:       { type: String, required: true },
    closesAt:      { type: String, required: true },
    dietType:      { type: String, enum: ['veg', 'non-veg', 'both'], default: 'both' },
    cuisineType:   { type: String, default: 'multi' },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    noOfTables:    { type: Number, default: 0 },
    logo:          { type: String },
  },
  { timestamps: true }
);

export const RestaurantModel = mongoose.model<IRestaurantDocument>('Restaurant', RestaurantSchema);
