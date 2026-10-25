import { Router } from 'express';
import {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  loginRateLimit,
  registerRateLimit,
  passwordResetRateLimit,
  resetPasswordRateLimit,
} from '../middlewares/rateLimit.middleware.js';

const authRoutes = Router();

authRoutes.post('/register', registerRateLimit, register);
authRoutes.post('/login', loginRateLimit, login);
authRoutes.post('/forgot-password', passwordResetRateLimit, forgotPassword);
authRoutes.post('/reset-password', resetPasswordRateLimit, resetPassword);

authRoutes.get('/me', authMiddleware, me);
authRoutes.put('/me', authMiddleware, updateProfile);
authRoutes.put('/me/password', authMiddleware, changePassword);

export { authRoutes };