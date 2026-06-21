import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT) || 3000,
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'access_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_ORIGINS: [
    process.env.CLIENT_ORIGIN_ADMIN || 'http://localhost:5174',
    process.env.CLIENT_ORIGIN_STAFF || 'http://localhost:5175',
    process.env.CLIENT_ORIGIN_CUSTOMER || 'http://localhost:5176',
  ],
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
