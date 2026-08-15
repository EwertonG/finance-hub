import { Router } from 'express';
import {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const categoryRoutes = Router();

categoryRoutes.use(authMiddleware);

categoryRoutes.post('/', createCategory);
categoryRoutes.get('/', listCategories);
categoryRoutes.put('/:id', updateCategory);
categoryRoutes.delete('/:id', deleteCategory);

export { categoryRoutes };