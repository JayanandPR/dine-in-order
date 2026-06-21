import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'staff' | 'customer';

export interface IUserDocument extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  photo?: string;
  restaurantId?: mongoose.Types.ObjectId;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role:     { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
    photo:    { type: String },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
