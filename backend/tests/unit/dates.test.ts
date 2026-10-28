import { describe, it, expect } from 'vitest';
import { buildDateFilter } from '../../src/lib/dateFilter.js';
import { subscriptionPeriod } from '../../src/lib/recurrence.js';

describe('buildDateFilter', () => {
  it('sem ano não filtra nada', () => {
    expect(buildDateFilter(undefined, undefined)).toEqual({});
  });

  it('com mês e ano cobre o mês inteiro em UTC', () => {
    expect(buildDateFilter(2, 2028)).toEqual({
      date: {
        gte: new Date('2028-02-01T00:00:00.000Z'),
        lte: new Date('2028-02-29T23:59:59.999Z'),
      },
    });
  });

  it('só com ano cobre o ano inteiro', () => {
    expect(buildDateFilter(undefined, 2026)).toEqual({
      date: {
        gte: new Date('2026-01-01T00:00:00.000Z'),
        lte: new Date('2026-12-31T23:59:59.999Z'),
      },
    });
  });
});

describe('subscriptionPeriod', () => {
  const start = new Date('2026-07-31T00:00:00.000Z');

  it('o mês de início é o período 1', () => {
    expect(subscriptionPeriod(start, new Date('2026-07-31T10:00:00.000Z'))).toBe(1);
  });

  it('conta meses, não dias', () => {
    expect(subscriptionPeriod(start, new Date('2026-08-01T00:00:00.000Z'))).toBe(2);
    expect(subscriptionPeriod(start, new Date('2026-10-15T00:00:00.000Z'))).toBe(4);
  });

  it('atravessa a virada do ano', () => {
    expect(subscriptionPeriod(start, new Date('2027-01-10T00:00:00.000Z'))).toBe(7);
  });

  it('antes do início o período é zero ou negativo', () => {
    expect(subscriptionPeriod(start, new Date('2026-06-15T00:00:00.000Z'))).toBe(0);
  });
});
