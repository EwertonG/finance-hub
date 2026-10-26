import { z } from 'zod';
import { requiredText, positiveAmount, hexColor } from './common.js';

const budget = z.preprocess(
  (value) => (value === '' ? null : value),
  positiveAmount('O orçamento').nullable().optional()
);

export const createCategorySchema = z.object({
  name: requiredText('O nome', 50),
  color: hexColor.optional(),
  icon: z.string().max(60).optional(),
  budget,
});

export const updateCategorySchema = createCategorySchema.partial();
