export type UserRole = 'admin' | 'staff' | 'customer';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  restaurantId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}