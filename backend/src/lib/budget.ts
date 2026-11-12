import { prisma } from './prisma.js';
import { buildDateFilter } from './dateFilter.js';

const WARNING_RATIO = 0.8;

export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  level: 'warning' | 'exceeded';
  budget: number;
  spent: number;
  percentage: number;
}

const toCents = (value: number) => Math.round(value * 100);

export function isSameUtcMonth(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

export async function checkBudgetCrossing(
  userId: string,
  categoryId: string | null | undefined,
  date: Date,
  addedAmount: number
): Promise<BudgetAlert | null> {
  if (!categoryId || addedAmount <= 0) return null;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { name: true, budget: true },
  });
  if (!category?.budget) return null;

  const totals = await prisma.transaction.aggregate({
    where: {
      userId,
      categoryId,
      type: 'EXPENSE',
      ...buildDateFilter(date.getUTCMonth() + 1, date.getUTCFullYear()),
    },
    _sum: { amount: true },
  });

  const budgetCents = toCents(Number(category.budget));
  const spentCents = toCents(Number(totals._sum.amount ?? 0));
  const beforeCents = spentCents - toCents(addedAmount);
  const warningCents = budgetCents * WARNING_RATIO;

  let level: BudgetAlert['level'] | null = null;
  if (beforeCents < budgetCents && spentCents >= budgetCents) level = 'exceeded';
  else if (beforeCents < warningCents && spentCents >= warningCents) level = 'warning';
  if (!level) return null;

  return {
    categoryId,
    categoryName: category.name,
    level,
    budget: budgetCents / 100,
    spent: spentCents / 100,
    percentage: Math.round((spentCents / budgetCents) * 100),
  };
}
