// Com apenas "year" filtra o ano inteiro; com "month" e "year" filtra o mês
// específico. Compartilhado entre transaction e debtor controllers, que
// filtram pelo mesmo padrão de período.
export function buildDateFilter(month: unknown, year: unknown) {
  if (!year) return {};

  const parsedYear = parseInt(String(year), 10);
  const parsedMonth = month ? parseInt(String(month), 10) : undefined;

  // Datas são armazenadas em UTC-meia-noite (mesma convenção de
  // lib/recurrence.ts). Construir os limites com Date.UTC em vez do
  // construtor local evita que o fuso do servidor desloque a janela e
  // esconda lançamentos perto da virada do mês/ano.
  const startDate = parsedMonth
    ? new Date(Date.UTC(parsedYear, parsedMonth - 1, 1))
    : new Date(Date.UTC(parsedYear, 0, 1));
  const endDate = parsedMonth
    ? new Date(Date.UTC(parsedYear, parsedMonth, 0, 23, 59, 59, 999))
    : new Date(Date.UTC(parsedYear, 11, 31, 23, 59, 59, 999));

  return {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };
}
