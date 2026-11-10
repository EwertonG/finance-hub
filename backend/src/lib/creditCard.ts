function clampedUtcDate(year: number, monthIndex: number, day: number) {
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, monthIndex, Math.min(day, daysInMonth)));
}

export function getInvoicePeriod(closingDay: number, dueDay: number, month: number, year: number) {
  const dueMonthIndex = month - 1;
  const closingMonthIndex = closingDay < dueDay ? dueMonthIndex : dueMonthIndex - 1;

  const dueDate = clampedUtcDate(year, dueMonthIndex, dueDay);
  const closingDate = clampedUtcDate(year, closingMonthIndex, closingDay);
  const previousClosingDate = clampedUtcDate(year, closingMonthIndex - 1, closingDay);

  return {
    start: previousClosingDate,
    endExclusive: closingDate,
    closingDate,
    dueDate,
  };
}
