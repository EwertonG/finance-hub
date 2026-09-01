import { Router } from 'express';
import { register, login, me, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);

authRoutes.get('/me', authMiddleware, me);
authRoutes.put('/me', authMiddleware, updateProfile);
authRoutes.put('/me/password', authMiddleware, changePassword);

export { authRoutes };