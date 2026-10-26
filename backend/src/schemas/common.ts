import { z } from 'zod';

z.config(z.locales.ptBR());

export const PAYMENT_METHODS = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH'] as const;
const MAX_AMOUNT = 99_999_999.99;

const emptyToNull = (value: unknown) => (value === '' ? null : value);
const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

const isMissing = (value: unknown) => value === undefined || value === null;

function requiredMessage(label: string) {
  return `${label} é ${label.startsWith('A ') ? 'obrigatória' : 'obrigatório'}.`;
}

const toNumber = (value: unknown) => {
  if (value === '') return undefined;
  return typeof value === 'string' ? Number(value) : value;
};

const toDate = (value: unknown) => {
  if (value === '') return undefined;
  return typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
};

export function requiredText(label: string, max: number) {
  return z
    .string({ error: requiredMessage(label) })
    .trim()
    .min(1, requiredMessage(label))
    .max(max, `${label} deve ter no máximo ${max} caracteres.`);
}

export function positiveAmount(label: string) {
  return z.preprocess(
    toNumber,
    z
      .number({
        error: (issue) => (isMissing(issue.input) ? requiredMessage(label) : `${label} deve ser um número.`),
      })
      .positive(`${label} deve ser maior que zero.`)
      .max(MAX_AMOUNT, `${label} é maior que o permitido.`)
  );
}

export function requiredDate(label: string) {
  return z.preprocess(
    toDate,
    z.date({
      error: (issue) => (isMissing(issue.input) ? `${label} é obrigatória.` : `${label} inválida.`),
    })
  );
}

export function optionalDate(label: string) {
  return z.preprocess(
    (value) => (value === '' ? null : toDate(value)),
    z.date({ error: `${label} inválida.` }).nullable().optional()
  );
}

export const transactionType = z.enum(['INCOME', 'EXPENSE'], {
  error: 'O tipo deve ser INCOME ou EXPENSE.',
});

export const optionalCategoryId = z.preprocess(emptyToNull, z.string().max(64).nullable().optional());

export const optionalPaymentMethod = z.preprocess(
  emptyToNull,
  z.enum(PAYMENT_METHODS, { error: 'Forma de pagamento inválida.' }).nullable().optional()
);

export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida.');

function optionalQueryInt(label: string, min: number, max: number) {
  return z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: `${label} inválido.` })
      .int(`${label} inválido.`)
      .min(min, `${label} inválido.`)
      .max(max, `${label} inválido.`)
      .optional()
  );
}

export const monthQuery = optionalQueryInt('Mês', 1, 12);
export const yearQuery = optionalQueryInt('Ano', 2000, 2100);
export const pageQuery = optionalQueryInt('Página', 1, 100_000);
export const limitQuery = optionalQueryInt('Limite', 1, 100);

export const periodQuerySchema = z.object({
  month: monthQuery,
  year: yearQuery,
});
