import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendError(res, 'No file provided', 400);
    return;
  }

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'dine-in-order/menu', resource_type: 'image' },
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
    stream.end(req.file!.buffer);
  });

  sendSuccess(res, { url: result.secure_url, publicId: result.public_id }, 201, 'Uploaded');
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const { publicId } = req.body;
  if (!publicId) { sendError(res, 'publicId required', 400); return; }
  await cloudinary.uploader.destroy(publicId);
  sendSuccess(res, null, 200, 'Deleted');
});