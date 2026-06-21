import { UserRole } from './auth.types';

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  photo?: string;
  restaurantId?: string;
  createdAt: Date;
  updatedAt: Date;
}
