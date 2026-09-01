import { Router } from 'express';
import {
  createTransaction,
  listTransactions,
  getTransactionSummary,
  getAnnualSummary,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const transactionRoutes = Router();

transactionRoutes.use(authMiddleware);

transactionRoutes.post('/', createTransaction);
transactionRoutes.get('/', listTransactions);
transactionRoutes.get('/summary', getTransactionSummary);
transactionRoutes.get('/annual-summary', getAnnualSummary);
transactionRoutes.put('/:id', updateTransaction);
transactionRoutes.delete('/:id', deleteTransaction);

export { transactionRoutes };