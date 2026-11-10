import { describe, it, expect } from 'vitest';
import { getInvoicePeriod } from '../../src/lib/creditCard.js';

const iso = (date: Date) => date.toISOString().slice(0, 10);

function describePeriod(closingDay: number, dueDay: number, month: number, year: number) {
  const period = getInvoicePeriod(closingDay, dueDay, month, year);
  return {
    start: iso(period.start),
    endExclusive: iso(period.endExclusive),
    closing: iso(period.closingDate),
    due: iso(period.dueDate),
  };
}

describe('período da fatura', () => {
  it('fecha e vence no mesmo mês quando o fechamento vem antes do vencimento', () => {
    expect(describePeriod(5, 12, 11, 2025)).toEqual({
      start: '2025-10-05',
      endExclusive: '2025-11-05',
      closing: '2025-11-05',
      due: '2025-11-12',
    });
  });

  it('fecha no mês anterior quando o vencimento vem antes do fechamento', () => {
    expect(describePeriod(28, 5, 11, 2025)).toEqual({
      start: '2025-09-28',
      endExclusive: '2025-10-28',
      closing: '2025-10-28',
      due: '2025-11-05',
    });
  });

  it('atravessa a virada do ano', () => {
    expect(describePeriod(28, 5, 1, 2026)).toEqual({
      start: '2025-11-28',
      endExclusive: '2025-12-28',
      closing: '2025-12-28',
      due: '2026-01-05',
    });
  });

  it('fechamento no dia 31 usa o último dia em meses mais curtos', () => {
    expect(describePeriod(31, 10, 3, 2026)).toEqual({
      start: '2026-01-31',
      endExclusive: '2026-02-28',
      closing: '2026-02-28',
      due: '2026-03-10',
    });
  });

  it('meses seguidos não se sobrepõem nem deixam buracos', () => {
    for (const [closingDay, dueDay] of [[5, 12], [28, 5], [31, 10], [1, 8]]) {
      for (let month = 1; month <= 12; month++) {
        const current = getInvoicePeriod(closingDay, dueDay, month, 2026);
        const next = getInvoicePeriod(closingDay, dueDay, month === 12 ? 1 : month + 1, month === 12 ? 2027 : 2026);
        expect(next.start.getTime()).toBe(current.endExclusive.getTime());
      }
    }
  });
});
