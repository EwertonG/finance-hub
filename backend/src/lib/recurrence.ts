import { prisma } from './prisma.js';

// Assinaturas não têm fim definido, então as transações são geradas sob
// demanda (sem cron): a cada leitura de lançamentos, garante que exista uma
// transação para cada período (mês) ainda não gerado, até o mês atual.
//
// Várias rotas (listTransactions, getTransactionSummary, getAnnualSummary,
// listRecurrences) chamam essa função, e uma única visita ao Dashboard bate
// em várias delas em sequência. Como o resultado não muda dentro de uma
// mesma janela curta, um debounce em memória por usuário evita repetir o
// mesmo trabalho (findMany + groupBy) várias vezes por carregamento de página.
const lastSyncByUser = new Map<string, number>();
const SYNC_DEBOUNCE_MS = 5 * 60 * 1000;

// "force" ignora o debounce: usado logo após criar uma assinatura nova, cuja
// primeira transação precisa existir imediatamente, não só na próxima janela.
export function subscriptionPeriod(startDate: Date, date: Date = new Date()) {
  return (
    (date.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    (date.getUTCMonth() - startDate.getUTCMonth()) +
    1
  );
}

export async function ensureSubscriptionTransactions(userId: string, force = false) {
  const lastSync = lastSyncByUser.get(userId);
  if (!force && lastSync && Date.now() - lastSync < SYNC_DEBOUNCE_MS) return;
  lastSyncByUser.set(userId, Date.now());

  const subscriptions = await prisma.recurrence.findMany({
    where: { userId, kind: 'SUBSCRIPTION', active: true },
  });

  const now = new Date();

  for (const subscription of subscriptions) {
    const currentPeriod = subscriptionPeriod(subscription.startDate, now);
    if (currentPeriod <= subscription.lastGeneratedPeriod) continue;

    const startYear = subscription.startDate.getUTCFullYear();
    const startMonth = subscription.startDate.getUTCMonth();
    const day = subscription.startDate.getUTCDate();
    const missingTransactions = [];

    for (let period = subscription.lastGeneratedPeriod + 1; period <= currentPeriod; period++) {
      const month = startMonth + period - 1;
      const daysInMonth = new Date(Date.UTC(startYear, month + 1, 0)).getUTCDate();

      missingTransactions.push({
        description: subscription.description,
        amount: subscription.amount,
        date: new Date(Date.UTC(startYear, month, Math.min(day, daysInMonth))),
        type: subscription.type,
        userId: subscription.userId,
        categoryId: subscription.categoryId,
        paymentMethod: subscription.paymentMethod,
        recurrenceId: subscription.id,
        installmentNumber: period,
      });
    }

    await prisma.$transaction([
      prisma.transaction.createMany({ data: missingTransactions, skipDuplicates: true }),
      prisma.recurrence.update({
        where: { id: subscription.id },
        data: { lastGeneratedPeriod: currentPeriod },
      }),
    ]);
  }
}
