import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import type { TokenPayload } from '../types/express';

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions);

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, ENV.JWT_ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, ENV.JWT_REFRESH_SECRET) as TokenPayload;