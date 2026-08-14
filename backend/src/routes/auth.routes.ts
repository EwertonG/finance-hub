import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const authRoutes = Router();

authRoutes.post('/register', register);

authRoutes.post('/login', login);

export { authRoutes };