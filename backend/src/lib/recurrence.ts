import { prisma } from './prisma.js';

// Assinaturas não têm fim definido, então as transações são geradas sob
// demanda (sem cron): a cada leitura de lançamentos, garante que exista uma
// transação para cada período (mês) já decorrido desde o início.
export async function ensureSubscriptionTransactions(userId: string) {
  const subscriptions = await prisma.recurrence.findMany({
    where: { userId, kind: 'SUBSCRIPTION', active: true },
  });

  const now = new Date();

  for (const subscription of subscriptions) {
    const existingCount = await prisma.transaction.count({
      where: { recurrenceId: subscription.id },
    });

    const monthsElapsed =
      (now.getFullYear() - subscription.startDate.getFullYear()) * 12 +
      (now.getMonth() - subscription.startDate.getMonth()) +
      1;

    if (monthsElapsed <= existingCount) continue;

    const day = subscription.startDate.getDate();
    const missingTransactions = [];

    for (let i = existingCount; i < monthsElapsed; i++) {
      const chargeDate = new Date(subscription.startDate.getFullYear(), subscription.startDate.getMonth() + i, 1);
      const daysInMonth = new Date(chargeDate.getFullYear(), chargeDate.getMonth() + 1, 0).getDate();
      chargeDate.setDate(Math.min(day, daysInMonth));

      missingTransactions.push({
        description: subscription.description,
        amount: subscription.amount,
        date: chargeDate,
        type: subscription.type,
        userId: subscription.userId,
        categoryId: subscription.categoryId,
        recurrenceId: subscription.id,
      });
    }

    await prisma.transaction.createMany({ data: missingTransactions });
  }
}
