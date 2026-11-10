import { z } from 'zod';

function dayOfMonth(label: string) {
  return z.coerce
    .number({ error: `${label} inválido.` })
    .int(`${label} inválido.`)
    .min(1, `${label} deve estar entre 1 e 31.`)
    .max(31, `${label} deve estar entre 1 e 31.`);
}

export const upsertCreditCardSchema = z
  .object({
    closingDay: dayOfMonth('O dia de fechamento'),
    dueDay: dayOfMonth('O dia de vencimento'),
  })
  .refine((data) => data.closingDay !== data.dueDay, {
    message: 'O vencimento deve ser em um dia diferente do fechamento.',
    path: ['dueDay'],
  });

export const invoiceQuerySchema = z.object({
  month: z.coerce
    .number({ error: 'Mês inválido.' })
    .int('Mês inválido.')
    .min(1, 'Mês inválido.')
    .max(12, 'Mês inválido.'),
  year: z.coerce
    .number({ error: 'Ano inválido.' })
    .int('Ano inválido.')
    .min(2000, 'Ano inválido.')
    .max(2100, 'Ano inválido.'),
});
