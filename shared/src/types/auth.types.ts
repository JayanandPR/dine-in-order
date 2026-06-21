export type UserRole = 'admin' | 'staff' | 'customer';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  restaurantId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    photo?: string;
  };
  tokens: AuthTokens;
}
