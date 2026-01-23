import { Router } from 'express';
import { authRateLimiter, validate } from '../middlewares/index.js';
import {
  register,
  login,
  getProfile,
  logout,
  registerSchema,
  loginSchema,
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/index.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', authMiddleware, logout);

export const authRoutes = router;
