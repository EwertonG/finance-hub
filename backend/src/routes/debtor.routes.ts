import { Router } from 'express';
import {
  createDebtor,
  listDebtors,
  getDebtorsSummary,
  updateDebtor,
  deleteDebtor,
} from '../controllers/debtor.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createDebtorSchema, updateDebtorSchema, debtorFiltersQuerySchema } from '../schemas/debtor.schema.js';
import { periodQuerySchema } from '../schemas/common.js';

const debtorRoutes = Router();

debtorRoutes.use(authMiddleware);

debtorRoutes.post('/', validate({ body: createDebtorSchema }), createDebtor);
debtorRoutes.get('/', validate({ query: debtorFiltersQuerySchema }), listDebtors);
debtorRoutes.get('/summary', validate({ query: periodQuerySchema }), getDebtorsSummary);
debtorRoutes.put('/:id', validate({ body: updateDebtorSchema }), updateDebtor);
debtorRoutes.delete('/:id', deleteDebtor);

export { debtorRoutes };