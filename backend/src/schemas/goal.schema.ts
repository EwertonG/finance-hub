import { z } from 'zod';
import { requiredText, positiveAmount, optionalDate, hexColor } from './common.js';

export const createGoalSchema = z.object({
  name: requiredText('O nome', 100),
  targetAmount: positiveAmount('O valor alvo'),
  targetDate: optionalDate('Data alvo'),
  color: hexColor.optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const createContributionSchema = z.object({
  amount: positiveAmount('O valor'),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL'], { error: 'type deve ser DEPOSIT ou WITHDRAWAL.' }),
  note: z.string().trim().max(200, 'A observação deve ter no máximo 200 caracteres.').optional(),
});
