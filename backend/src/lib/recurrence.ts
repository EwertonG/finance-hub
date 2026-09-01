import { prisma } from './prisma.js';

// Assinaturas não têm fim definido, então as transações são geradas sob
// demanda (sem cron): a cada leitura de lançamentos, garante que exista uma
// transação para cada período (mês) já decorrido desde o início.
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
export async function ensureSubscriptionTransactions(userId: string, force = false) {
  const lastSync = lastSyncByUser.get(userId);
  if (!force && lastSync && Date.now() - lastSync < SYNC_DEBOUNCE_MS) return;
  lastSyncByUser.set(userId, Date.now());

  const subscriptions = await prisma.recurrence.findMany({
    where: { userId, kind: 'SUBSCRIPTION', active: true },
  });

  if (subscriptions.length === 0) return;

  const now = new Date();

  // Uma única query agrupada em vez de um count por assinatura: essa função
  // roda em toda leitura de lançamentos, então o custo por assinatura soma rápido.
  const counts = await prisma.transaction.groupBy({
    by: ['recurrenceId'],
    where: { recurrenceId: { in: subscriptions.map((s) => s.id) } },
    _count: true,
  });
  const existingCountByRecurrence = new Map(counts.map((c) => [c.recurrenceId, c._count]));

  for (const subscription of subscriptions) {
    const existingCount = existingCountByRecurrence.get(subscription.id) ?? 0;

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
