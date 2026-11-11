import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ensureSubscriptionTransactions } from '../lib/recurrence.js';
import { getInvoicePeriod } from '../lib/creditCard.js';

const cardSelect = { id: true, name: true, closingDay: true, dueDay: true } as const;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function getCreditCard(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const card = await prisma.creditCard.findUnique({ where: { userId }, select: cardSelect });
    return res.json(card);
  } catch (error) {
    console.error('Erro ao buscar cartão de crédito:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar cartão de crédito.' });
  }
}

export async function upsertCreditCard(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { closingDay, dueDay } = req.body;

    const card = await prisma.creditCard.upsert({
      where: { userId },
      create: { userId, closingDay, dueDay },
      update: { closingDay, dueDay },
      select: cardSelect,
    });

    return res.json(card);
  } catch (error) {
    console.error('Erro ao salvar cartão de crédito:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar cartão de crédito.' });
  }
}

export async function deleteCreditCard(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    await prisma.creditCard.deleteMany({ where: { userId } });
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover cartão de crédito:', error);
    return res.status(500).json({ error: 'Erro interno ao remover cartão de crédito.' });
  }
}

export async function getCreditCardInvoice(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { month, year } = req.query as unknown as { month: number; year: number };

    const card = await prisma.creditCard.findUnique({ where: { userId } });
    if (!card) {
      return res.json({ configured: false });
    }

    await ensureSubscriptionTransactions(userId);

    const period = getInvoicePeriod(card.closingDay, card.dueDay, month, year);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        paymentMethod: 'CREDIT_CARD',
        date: { gte: period.start, lt: period.endExclusive },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        date: true,
        installmentNumber: true,
        recurrence: { select: { kind: true, installmentTotal: true } },
        category: { select: { id: true, name: true, color: true, icon: true } },
      },
      orderBy: { date: 'asc' },
    });

    const totalCents = transactions.reduce((sum, t) => sum + Math.round(Number(t.amount) * 100), 0);

    return res.json({
      configured: true,
      month,
      year,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      periodStart: period.start,
      periodEnd: new Date(period.endExclusive.getTime() - DAY_MS),
      closingDate: period.closingDate,
      dueDate: period.dueDate,
      total: totalCents / 100,
      transactions,
    });
  } catch (error) {
    console.error('Erro ao calcular fatura do cartão:', error);
    return res.status(500).json({ error: 'Erro interno ao calcular fatura do cartão.' });
  }
}
