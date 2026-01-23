import { Router, Request, Response, NextFunction } from 'express';
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

// Wrap async handlers to catch errors
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/register', authRateLimiter, validate(registerSchema), asyncHandler(register));
router.post('/login', authRateLimiter, validate(loginSchema), asyncHandler(login));
router.get('/profile', authMiddleware, asyncHandler(getProfile));
router.post('/logout', authMiddleware, asyncHandler(logout));

export const authRoutes = router;
