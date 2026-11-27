// Geração do CSV de lançamentos. Formato pensado para abrir direto no Excel
// em português: separador ";", vírgula decimal, datas dd/mm/aaaa, quebra de
// linha CRLF e BOM UTF-8 (sem ele o Excel quebra os acentos).

export const CSV_SEPARATOR = ';';
const CSV_BOM = '\uFEFF';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Débito',
  CASH: 'Dinheiro',
};

const TYPE_LABELS: Record<string, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
};

// Células que começam com estes caracteres são interpretadas como fórmula
// pelo Excel/Sheets ("CSV injection"). A descrição vem do usuário, então
// recebe um apóstrofo na frente para ser tratada sempre como texto.
const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

export function escapeCsvField(value: string): string {
  const safe = FORMULA_TRIGGERS.some((char) => value.startsWith(char)) ? `'${value}` : value;

  if (/[";\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function formatCsvAmount(amount: unknown): string {
  return Number(amount).toFixed(2).replace('.', ',');
}

// "date" é guardada em UTC-meia-noite (ver lib/dateFilter.ts), então lê os
// campos em UTC para não deslocar o dia conforme o fuso do servidor.
export function formatCsvDate(date: Date): string {
  const [year, month, day] = date.toISOString().slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export interface ExportableTransaction {
  date: Date;
  description: string;
  type: string;
  amount: unknown;
  paymentMethod: string | null;
  installmentNumber: number | null;
  category: { name: string } | null;
  recurrence: { installmentTotal: number | null } | null;
}

const HEADER = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Forma de pagamento', 'Parcela', 'Valor (R$)'];

export function buildTransactionsCsv(transactions: ExportableTransaction[]): string {
  const rows = transactions.map((tx) => {
    const installment =
      tx.installmentNumber && tx.recurrence?.installmentTotal
        ? `${tx.installmentNumber}/${tx.recurrence.installmentTotal}`
        : '';

    return [
      formatCsvDate(tx.date),
      tx.description,
      TYPE_LABELS[tx.type] ?? tx.type,
      tx.category?.name ?? 'Sem categoria',
      tx.paymentMethod ? (PAYMENT_METHOD_LABELS[tx.paymentMethod] ?? tx.paymentMethod) : '',
      installment,
      formatCsvAmount(tx.amount),
    ];
  });

  const lines = [HEADER, ...rows].map((row) => row.map(escapeCsvField).join(CSV_SEPARATOR));
  return CSV_BOM + lines.join('\r\n') + '\r\n';
}