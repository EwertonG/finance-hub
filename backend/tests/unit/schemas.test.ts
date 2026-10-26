import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../../src/schemas/auth.schema.js';
import { createTransactionSchema, transactionFiltersQuerySchema } from '../../src/schemas/transaction.schema.js';
import { createRecurrenceSchema } from '../../src/schemas/recurrence.schema.js';

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.success ? null : result.error!.issues[0].message;
}

describe('cadastro', () => {
  it('normaliza o e-mail para minúsculas e sem espaços', () => {
    const result = registerSchema.parse({ name: 'Ana', email: '  ANA@Teste.COM ', password: 'Senha@123' });
    expect(result.email).toBe('ana@teste.com');
  });

  it('exige senha forte', () => {
    const result = registerSchema.safeParse({ name: 'Ana', email: 'ana@teste.com', password: 'fraca' });
    expect(firstError(result)).toContain('pelo menos 8 caracteres');
  });

  it('o login aceita senhas antigas fora da regra atual', () => {
    expect(loginSchema.safeParse({ email: 'ana@teste.com', password: '123' }).success).toBe(true);
  });
});

describe('lançamento', () => {
  const valid = { description: 'Mercado', amount: 52.3, type: 'EXPENSE', date: '2026-10-20' };

  it('converte a data para meia-noite UTC', () => {
    const result = createTransactionSchema.parse(valid);
    expect(result.date.toISOString()).toBe('2026-10-20T00:00:00.000Z');
  });

  it('converte categoria vazia em null', () => {
    expect(createTransactionSchema.parse({ ...valid, categoryId: '' }).categoryId).toBeNull();
  });

  it.each([
    [{ amount: -5 }, 'O valor deve ser maior que zero.'],
    [{ amount: 'abc' }, 'O valor deve ser um número.'],
    [{ date: 'ontem' }, 'Data inválida.'],
    [{ type: 'OUTRO' }, 'O tipo deve ser INCOME ou EXPENSE.'],
    [{ description: '   ' }, 'A descrição é obrigatória.'],
    [{ paymentMethod: 'BOLETO' }, 'Forma de pagamento inválida.'],
  ])('recusa %o', (override, message) => {
    expect(firstError(createTransactionSchema.safeParse({ ...valid, ...override }))).toBe(message);
  });
});

describe('filtros da listagem', () => {
  it('converte os parâmetros da URL em números', () => {
    const result = transactionFiltersQuerySchema.parse({ month: '10', year: '2026', page: '2', limit: '10' });
    expect(result).toMatchObject({ month: 10, year: 2026, page: 2, limit: 10 });
  });

  it('recusa mês fora de 1 a 12', () => {
    expect(firstError(transactionFiltersQuerySchema.safeParse({ month: '13' }))).toBe('Mês inválido.');
  });
});

describe('parcelamento', () => {
  const valid = {
    description: 'TV',
    totalAmount: 1200,
    type: 'EXPENSE',
    startDate: '2026-10-05',
    kind: 'INSTALLMENT',
    installmentTotal: 10,
  };

  it('a parcela atual começa em 1 quando não é informada', () => {
    const result = createRecurrenceSchema.parse(valid);
    expect(result.kind === 'INSTALLMENT' && result.startInstallmentNumber).toBe(1);
  });

  it('recusa parcela atual maior que o total', () => {
    const result = createRecurrenceSchema.safeParse({ ...valid, startInstallmentNumber: 11 });
    expect(firstError(result)).toBe('A parcela atual deve estar entre 1 e o total de parcelas.');
  });
});
