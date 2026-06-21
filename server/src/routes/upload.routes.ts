import { Router } from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/',       authenticate, authorize('admin'), upload.single('image'), uploadImage);
router.delete('/',     authenticate, authorize('admin'), deleteImage);

export default router;