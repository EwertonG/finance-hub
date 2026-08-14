import { Router } from 'express';
import {
  createDebtor,
  listDebtors,
  getDebtorsSummary,
  updateDebtor,
  deleteDebtor,
} from '../controllers/debtor.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const debtorRoutes = Router();

debtorRoutes.use(authMiddleware);

debtorRoutes.post('/', createDebtor);
debtorRoutes.get('/', listDebtors);
debtorRoutes.get('/summary', getDebtorsSummary);
debtorRoutes.put('/:id', updateDebtor);
debtorRoutes.delete('/:id', deleteDebtor);

export { debtorRoutes };