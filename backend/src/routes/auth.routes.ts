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
import { validate } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema.js';
import {
  loginRateLimit,
  registerRateLimit,
  passwordResetRateLimit,
  resetPasswordRateLimit,
} from '../middlewares/rateLimit.middleware.js';

const authRoutes = Router();

authRoutes.post('/register', registerRateLimit, validate({ body: registerSchema }), register);
authRoutes.post('/login', loginRateLimit, validate({ body: loginSchema }), login);
authRoutes.post('/forgot-password', passwordResetRateLimit, validate({ body: forgotPasswordSchema }), forgotPassword);
authRoutes.post('/reset-password', resetPasswordRateLimit, validate({ body: resetPasswordSchema }), resetPassword);

authRoutes.get('/me', authMiddleware, me);
authRoutes.put('/me', authMiddleware, validate({ body: updateProfileSchema }), updateProfile);
authRoutes.put('/me/password', authMiddleware, validate({ body: changePasswordSchema }), changePassword);

export { authRoutes };