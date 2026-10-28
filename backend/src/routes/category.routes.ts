import { Router } from 'express';
import {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema.js';

const categoryRoutes = Router();

categoryRoutes.use(authMiddleware);

categoryRoutes.post('/', validate({ body: createCategorySchema }), createCategory);
categoryRoutes.get('/', listCategories);
categoryRoutes.put('/:id', validate({ body: updateCategorySchema }), updateCategory);
categoryRoutes.delete('/:id', deleteCategory);

export { categoryRoutes };