import { z } from 'zod';
import {
  requiredText,
  positiveAmount,
  requiredDate,
  transactionType,
  optionalCategoryId,
  optionalPaymentMethod,
} from './common.js';

const baseRecurrence = {
  description: requiredText('A descrição', 200),
  type: transactionType,
  startDate: requiredDate('Data de início'),
  categoryId: optionalCategoryId,
  paymentMethod: optionalPaymentMethod,
};

const installmentSchema = z.object({
  ...baseRecurrence,
  kind: z.literal('INSTALLMENT'),
  installmentTotal: z.coerce
    .number({ error: 'Número de parcelas inválido.' })
    .int('Número de parcelas inválido.')
    .min(2, 'Parcelamento requer um número de parcelas maior ou igual a 2.')
    .max(120, 'O parcelamento pode ter no máximo 120 parcelas.'),
  totalAmount: positiveAmount('O valor total'),
  startInstallmentNumber: z.coerce
    .number({ error: 'Parcela atual inválida.' })
    .int('Parcela atual inválida.')
    .min(1, 'A parcela atual deve estar entre 1 e o total de parcelas.')
    .default(1),
});

const subscriptionSchema = z.object({
  ...baseRecurrence,
  kind: z.literal('SUBSCRIPTION'),
  amount: positiveAmount('O valor da assinatura'),
});

export const createRecurrenceSchema = z
  .discriminatedUnion('kind', [installmentSchema, subscriptionSchema], {
    error: 'kind deve ser INSTALLMENT ou SUBSCRIPTION.',
  })
  .superRefine((data, ctx) => {
    if (data.kind === 'INSTALLMENT' && data.startInstallmentNumber > data.installmentTotal) {
      ctx.addIssue({
        code: 'custom',
        path: ['startInstallmentNumber'],
        message: 'A parcela atual deve estar entre 1 e o total de parcelas.',
      });
    }
  });

export const updateRecurrenceSchema = z
  .object({
    active: z.boolean({ error: 'Informe se a assinatura está ativa (true ou false).' }).optional(),
    description: requiredText('A descrição', 200).optional(),
    amount: positiveAmount('O valor da assinatura').optional(),
    categoryId: optionalCategoryId,
    paymentMethod: optionalPaymentMethod,
    applyToCurrentMonth: z.boolean({ error: 'applyToCurrentMonth deve ser true ou false.' }).default(false),
  })
  .refine(
    ({ active, description, amount, categoryId, paymentMethod }) =>
      [active, description, amount, categoryId, paymentMethod].some((value) => value !== undefined),
    { message: 'Informe o que deseja alterar na assinatura.' }
  );

export const recurrenceFiltersQuerySchema = z.object({
  kind: z.enum(['INSTALLMENT', 'SUBSCRIPTION'], { error: 'kind deve ser INSTALLMENT ou SUBSCRIPTION.' }).optional(),
});
