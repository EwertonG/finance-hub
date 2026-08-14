import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);

authRoutes.get('/me', authMiddleware, me);

export { authRoutes };