import { Router } from 'express';
import { z } from 'zod';
import { register, login, refresh, logout, me, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';


const router = Router();

const registerSchema = z.object({
  body: z.object({
    username: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['admin', 'staff', 'customer']).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.patch('/change-password', authenticate, changePassword);

export default router;
