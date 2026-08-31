// Com apenas "year" filtra o ano inteiro; com "month" e "year" filtra o mês
// específico. Compartilhado entre transaction e debtor controllers, que
// filtram pelo mesmo padrão de período.
export function buildDateFilter(month: unknown, year: unknown) {
  if (!year) return {};

  const parsedYear = parseInt(String(year), 10);
  const parsedMonth = month ? parseInt(String(month), 10) : undefined;

  const startDate = parsedMonth
    ? new Date(parsedYear, parsedMonth - 1, 1)
    : new Date(parsedYear, 0, 1);
  const endDate = parsedMonth
    ? new Date(parsedYear, parsedMonth, 0, 23, 59, 59, 999)
    : new Date(parsedYear, 11, 31, 23, 59, 59, 999);

  return {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };
}
