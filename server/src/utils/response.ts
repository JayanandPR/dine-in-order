import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message = 'Success'
): Response =>
  res.status(statusCode).json({ success: true, message, data });

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
): Response =>
  res.status(statusCode).json({ success: false, message, errors });