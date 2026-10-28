import { describe, it, expect } from 'vitest';
import { splitAmount } from '../../src/lib/money.js';

describe('splitAmount', () => {
  it('divide igualmente quando não sobram centavos', () => {
    expect(splitAmount(90, 3)).toEqual([30, 30, 30]);
  });

  it('coloca os centavos que sobram na última parte', () => {
    expect(splitAmount(100, 3)).toEqual([33.33, 33.33, 33.34]);
  });

  it.each([
    [100, 3],
    [0.1, 3],
    [1999.99, 12],
    [33.33, 7],
    [250.01, 4],
  ])('a soma das partes de %s em %s vezes é exatamente o total', (total, parts) => {
    const sum = splitAmount(total, parts).reduce((acc, value) => acc + Math.round(value * 100), 0);
    expect(sum).toBe(Math.round(total * 100));
  });
});
