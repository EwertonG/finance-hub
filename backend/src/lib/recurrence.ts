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

    // Datas são armazenadas como UTC-meia-noite; usar os getters locais aqui
    // misturaria fuso e deslocaria o dia (bug já visto em teste manual).
    const monthsElapsed =
      (now.getUTCFullYear() - subscription.startDate.getUTCFullYear()) * 12 +
      (now.getUTCMonth() - subscription.startDate.getUTCMonth()) +
      1;

    if (monthsElapsed <= existingCount) continue;

    const day = subscription.startDate.getUTCDate();
    const missingTransactions = [];

    for (let i = existingCount; i < monthsElapsed; i++) {
      const year = subscription.startDate.getUTCFullYear();
      const month = subscription.startDate.getUTCMonth() + i;
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const chargeDate = new Date(Date.UTC(year, month, Math.min(day, daysInMonth)));

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
