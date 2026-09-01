import { Router } from 'express';
import {
  createTransaction,
  listTransactions,
  getTransactionSummary,
  getAnnualSummary,
  getCategoryBreakdown,
  getPaymentMethodBreakdown,
  getFirstTransactionDate,
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
transactionRoutes.get('/category-breakdown', getCategoryBreakdown);
transactionRoutes.get('/payment-method-breakdown', getPaymentMethodBreakdown);
transactionRoutes.get('/first-date', getFirstTransactionDate);
transactionRoutes.put('/:id', updateTransaction);
transactionRoutes.delete('/:id', deleteTransaction);

export { transactionRoutes };