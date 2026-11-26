import { describe, it, expect } from 'vitest';
import { buildExportFilename } from './exportCsv';

describe('buildExportFilename', () => {
  it('inclui ano e mês com dois dígitos no modo mensal', () => {
    expect(buildExportFilename(2026, 3)).toBe('lancamentos-2026-03.csv');
    expect(buildExportFilename(2026, 11)).toBe('lancamentos-2026-11.csv');
  });

  it('usa só o ano no modo anual', () => {
    expect(buildExportFilename(2026)).toBe('lancamentos-2026.csv');
  });
});