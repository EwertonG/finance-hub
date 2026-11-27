import { describe, it, expect } from 'vitest';
import {
  escapeCsvField,
  formatCsvAmount,
  formatCsvDate,
  buildTransactionsCsv,
  type ExportableTransaction,
} from '../../src/lib/csv.js';

describe('escapeCsvField', () => {
  it('mantém texto simples como está', () => {
    expect(escapeCsvField('Mercado')).toBe('Mercado');
  });

  it('coloca entre aspas quando há separador, aspas ou quebra de linha', () => {
    expect(escapeCsvField('Pão; leite')).toBe('"Pão; leite"');
    expect(escapeCsvField('Ele disse "oi"')).toBe('"Ele disse ""oi"""');
    expect(escapeCsvField('linha 1\nlinha 2')).toBe('"linha 1\nlinha 2"');
  });

  it.each(['=SOMA(A1:A2)', '+55 11 99999', '-10', '@usuario'])(
    'neutraliza fórmula (CSV injection): %s',
    (value) => {
      expect(escapeCsvField(value)).toBe(`'${value}`);
    }
  );
});

describe('formatCsvAmount', () => {
  it('usa vírgula decimal e duas casas', () => {
    expect(formatCsvAmount(350.5)).toBe('350,50');
    expect(formatCsvAmount('5000')).toBe('5000,00');
  });
});

describe('formatCsvDate', () => {
  it('lê a data em UTC, sem deslocar o dia', () => {
    expect(formatCsvDate(new Date('2026-10-31T00:00:00.000Z'))).toBe('31/10/2026');
  });
});

describe('buildTransactionsCsv', () => {
  const base: ExportableTransaction = {
    date: new Date('2026-10-10T00:00:00.000Z'),
    description: 'Mercado',
    type: 'EXPENSE',
    amount: 350.5,
    paymentMethod: 'PIX',
    installmentNumber: null,
    category: { name: 'Alimentação' },
    recurrence: null,
  };

  it('gera BOM, cabeçalho e linhas com CRLF', () => {
    const csv = buildTransactionsCsv([base]);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv.slice(1).split('\r\n')).toEqual([
      'Data;Descrição;Tipo;Categoria;Forma de pagamento;Parcela;Valor (R$)',
      '10/10/2026;Mercado;Despesa;Alimentação;Pix;;350,50',
      '',
    ]);
  });

  it('preenche parcela, categoria vazia e forma de pagamento ausente', () => {
    const csv = buildTransactionsCsv([
      {
        ...base,
        type: 'INCOME',
        category: null,
        paymentMethod: null,
        installmentNumber: 2,
        recurrence: { installmentTotal: 10 },
      },
    ]);

    expect(csv).toContain('10/10/2026;Mercado;Receita;Sem categoria;;2/10;350,50');
  });

  it('sem lançamentos devolve só o cabeçalho', () => {
    const lines = buildTransactionsCsv([]).slice(1).split('\r\n');
    expect(lines).toHaveLength(2);
  });
});