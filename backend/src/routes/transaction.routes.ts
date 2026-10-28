import { Router } from 'express';
import {
  createTransaction,
  listTransactions,
  getTransactionSummary,
  getAnnualSummary,
  getCategoryBreakdown,
  getPaymentMethodBreakdown,
  getFirstTransactionDate,
  getLastAddedTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFiltersQuerySchema,
  yearQuerySchema,
} from '../schemas/transaction.schema.js';
import { periodQuerySchema } from '../schemas/common.js';

const transactionRoutes = Router();

transactionRoutes.use(authMiddleware);

transactionRoutes.post('/', validate({ body: createTransactionSchema }), createTransaction);
transactionRoutes.get('/', validate({ query: transactionFiltersQuerySchema }), listTransactions);
transactionRoutes.get('/summary', validate({ query: transactionFiltersQuerySchema }), getTransactionSummary);
transactionRoutes.get('/annual-summary', validate({ query: yearQuerySchema }), getAnnualSummary);
transactionRoutes.get('/category-breakdown', validate({ query: periodQuerySchema }), getCategoryBreakdown);
transactionRoutes.get('/payment-method-breakdown', validate({ query: periodQuerySchema }), getPaymentMethodBreakdown);
transactionRoutes.get('/first-date', getFirstTransactionDate);
transactionRoutes.get('/last-added', getLastAddedTransaction);
transactionRoutes.put('/:id', validate({ body: updateTransactionSchema }), updateTransaction);
transactionRoutes.delete('/:id', deleteTransaction);

export { transactionRoutes };