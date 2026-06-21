import { Router } from 'express';
import { getTables, createTable, updateTableStatus, deleteTable, getTableSession } from '../controllers/table.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/:restaurantId',  authenticate, getTables);
router.post('/',              authenticate, authorize('admin'), createTable);
router.patch('/:id/status',   authenticate, authorize('admin', 'staff'), updateTableStatus);
router.delete('/:id',         authenticate, authorize('admin'), deleteTable);
router.get('/:tableId/session', getTableSession);

export default router;
