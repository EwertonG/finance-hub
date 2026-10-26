import { z } from 'zod';
import {
  requiredText,
  positiveAmount,
  requiredDate,
  optionalDate,
  optionalCategoryId,
  monthQuery,
  yearQuery,
  pageQuery,
  limitQuery,
} from './common.js';

const debtorStatus = z.enum(['PENDING', 'CHARGED', 'PAID'], {
  error: 'Status inválido.',
});

export const createDebtorSchema = z.object({
  item: requiredText('A descrição do item', 200),
  totalAmount: positiveAmount('O valor total'),
  people: z
    .array(requiredText('O nome da pessoa', 100), { error: 'Informe pelo menos 1 pessoa.' })
    .min(1, 'Informe pelo menos 1 pessoa.')
    .max(50, 'Informe no máximo 50 pessoas.'),
  mySplit: z.boolean().default(true),
  categoryId: optionalCategoryId,
  date: optionalDate('Data'),
});

export const updateDebtorSchema = z.object({
  personName: requiredText('O nome da pessoa', 100).optional(),
  item: requiredText('A descrição do item', 200).optional(),
  amount: positiveAmount('O valor').optional(),
  status: debtorStatus.optional(),
  date: requiredDate('Data').optional(),
});

export const debtorFiltersQuerySchema = z.object({
  status: debtorStatus.optional(),
  month: monthQuery,
  year: yearQuery,
  page: pageQuery,
  limit: limitQuery,
});
