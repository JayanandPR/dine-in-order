import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('admin'), getAnalytics);

export default router;