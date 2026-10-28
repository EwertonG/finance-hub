import { z } from 'zod';
import {
  PAYMENT_METHODS,
  requiredText,
  positiveAmount,
  requiredDate,
  transactionType,
  optionalCategoryId,
  optionalPaymentMethod,
  monthQuery,
  yearQuery,
  pageQuery,
  limitQuery,
} from './common.js';

export const createTransactionSchema = z.object({
  description: requiredText('A descrição', 200),
  amount: positiveAmount('O valor'),
  date: requiredDate('Data'),
  type: transactionType,
  categoryId: optionalCategoryId,
  paymentMethod: optionalPaymentMethod,
});

export const updateTransactionSchema = createTransactionSchema.partial();

const paymentMethodFilter = z
  .string()
  .optional()
  .refine(
    (value) =>
      !value || value.split(',').every((method) => (PAYMENT_METHODS as readonly string[]).includes(method)),
    'Forma de pagamento inválida.'
  );

export const transactionFiltersQuerySchema = z.object({
  month: monthQuery,
  year: yearQuery,
  type: transactionType.optional(),
  categoryId: z.string().max(64).optional(),
  paymentMethod: paymentMethodFilter,
  search: z.string().trim().max(100, 'A busca deve ter no máximo 100 caracteres.').optional(),
  page: pageQuery,
  limit: limitQuery,
});

export const yearQuerySchema = z.object({
  year: yearQuery,
});
