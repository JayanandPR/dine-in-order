import { Router } from 'express';
import { getStaff, createStaff, deleteStaff } from '../controllers/staff.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',     authenticate, authorize('admin'), getStaff);
router.post('/',    authenticate, authorize('admin'), createStaff);
router.delete('/:id', authenticate, authorize('admin'), deleteStaff);

export default router;
