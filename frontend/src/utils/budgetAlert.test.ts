import { describe, it, expect } from 'vitest';
import { buildBudgetAlertMessage, summarizeBudgets, buildBudgetSummaryMessage } from './budgetAlert';

const normalizeSpaces = (text: string) => text.replace(/\s/g, ' ');

describe('mensagem do alerta ao lançar', () => {
  it('perto do limite', () => {
    const message = buildBudgetAlertMessage({
      categoryId: 'c1', categoryName: 'Alimentação', level: 'warning', budget: 500, spent: 425, percentage: 85,
    });
    expect(normalizeSpaces(message)).toBe('Atenção: você já usou 85% do orçamento de Alimentação (R$ 425,00 de R$ 500,00).');
  });

  it('estourado mostra quanto passou', () => {
    const message = buildBudgetAlertMessage({
      categoryId: 'c1', categoryName: 'Lazer', level: 'exceeded', budget: 200, spent: 230.5, percentage: 115,
    });
    expect(normalizeSpaces(message)).toBe('Orçamento de Lazer estourado: R$ 230,50 de R$ 200,00 (R$ 30,50 acima).');
  });

  it('exatamente no limite não fala em "acima"', () => {
    const message = buildBudgetAlertMessage({
      categoryId: 'c1', categoryName: 'Lazer', level: 'exceeded', budget: 200, spent: 200, percentage: 100,
    });
    expect(normalizeSpaces(message)).toBe('Orçamento de Lazer estourado: R$ 200,00 de R$ 200,00.');
  });
});

describe('resumo do Dashboard', () => {
  const items = [
    { name: 'Alimentação', budget: 500, spent: 520 },
    { name: 'Lazer', budget: 200, spent: 170 },
    { name: 'Transporte', budget: 300, spent: 100 },
    { name: 'Saúde', budget: 100, spent: 100 },
  ];

  it('separa estouradas e perto do limite', () => {
    expect(summarizeBudgets(items)).toEqual({ exceeded: ['Alimentação', 'Saúde'], warning: ['Lazer'] });
  });

  it('monta a frase com plural e singular', () => {
    expect(buildBudgetSummaryMessage(summarizeBudgets(items))).toBe(
      'Alimentação e Saúde estouraram o orçamento · Lazer está perto do limite.'
    );
  });

  it('sem alertas, sem mensagem', () => {
    expect(buildBudgetSummaryMessage(summarizeBudgets([{ name: 'X', budget: 100, spent: 10 }]))).toBe('');
  });
});
