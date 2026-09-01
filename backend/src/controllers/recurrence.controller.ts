import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ensureSubscriptionTransactions } from '../lib/recurrence.js';

export async function createRecurrence(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { description, type, categoryId, startDate, kind, installmentTotal, totalAmount, amount } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!description || !type || !startDate || !kind) {
      return res.status(400).json({
        error: 'Descrição, tipo, data de início e tipo de recorrência são obrigatórios.',
      });
    }

    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({ error: 'O tipo deve ser INCOME ou EXPENSE.' });
    }

    if (kind !== 'INSTALLMENT' && kind !== 'SUBSCRIPTION') {
      return res.status(400).json({ error: 'kind deve ser INSTALLMENT ou SUBSCRIPTION.' });
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findFirst({
        where: { id: String(categoryId), userId },
      });

      if (!categoryExists) {
        return res.status(400).json({ error: 'Categoria informada não existe ou não pertence a este usuário.' });
      }
    }

    const start = new Date(startDate);

    if (kind === 'INSTALLMENT') {
      const total = parseInt(String(installmentTotal), 10);
      if (!total || total < 2) {
        return res.status(400).json({ error: 'Parcelamento requer um número de parcelas maior ou igual a 2.' });
      }

      const totalAmountNumber = Number(totalAmount);
      if (!totalAmount || isNaN(totalAmountNumber) || totalAmountNumber <= 0) {
        return res.status(400).json({ error: 'O valor total deve ser um número positivo.' });
      }

      const installmentAmount = Number((totalAmountNumber / total).toFixed(2));

      const recurrence = await prisma.recurrence.create({
        data: {
          description,
          amount: installmentAmount,
          type,
          kind: 'INSTALLMENT',
          startDate: start,
          installmentTotal: total,
          userId,
          categoryId: categoryId ? String(categoryId) : null,
        },
      });

      // Total já é conhecido de antemão, então todas as parcelas são
      // criadas de uma vez (diferente da assinatura, que não tem fim).
      // Datas são UTC-meia-noite; usar getters locais deslocaria o dia.
      const startYear = start.getUTCFullYear();
      const startMonth = start.getUTCMonth();
      const startDay = start.getUTCDate();

      const transactionsData = Array.from({ length: total }, (_, i) => {
        const month = startMonth + i;
        const daysInMonth = new Date(Date.UTC(startYear, month + 1, 0)).getUTCDate();
        return {
          description: `${description} (${i + 1}/${total})`,
          amount: installmentAmount,
          date: new Date(Date.UTC(startYear, month, Math.min(startDay, daysInMonth))),
          type,
          userId,
          categoryId: categoryId ? String(categoryId) : null,
          recurrenceId: recurrence.id,
          installmentNumber: i + 1,
        };
      });

      await prisma.transaction.createMany({ data: transactionsData });

      return res.status(201).json(recurrence);
    }

    // SUBSCRIPTION
    const amountNumber = Number(amount);
    if (!amount || isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: 'O valor da assinatura deve ser um número positivo.' });
    }

    const recurrence = await prisma.recurrence.create({
      data: {
        description,
        amount: amountNumber,
        type,
        kind: 'SUBSCRIPTION',
        startDate: start,
        userId,
        categoryId: categoryId ? String(categoryId) : null,
      },
      include: { category: true },
    });

    await ensureSubscriptionTransactions(userId, true);

    return res.status(201).json(recurrence);
  } catch (error) {
    console.error('Erro ao criar recorrência:', error);
    return res.status(500).json({ error: 'Erro interno ao criar recorrência.' });
  }
}

export async function listRecurrences(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { kind } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (kind === 'SUBSCRIPTION') {
      await ensureSubscriptionTransactions(userId);
    }

    const recurrences = await prisma.recurrence.findMany({
      where: {
        userId,
        ...(kind === 'INSTALLMENT' || kind === 'SUBSCRIPTION' ? { kind } : {}),
      },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(recurrences);
  } catch (error) {
    console.error('Erro ao listar recorrências:', error);
    return res.status(500).json({ error: 'Erro interno ao listar recorrências.' });
  }
}

export async function updateRecurrence(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { active } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!id) {
      return res.status(400).json({ error: 'ID da recorrência inválido.' });
    }

    const existing = await prisma.recurrence.findFirst({ where: { id: String(id), userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Recorrência não encontrada.' });
    }

    if (existing.kind !== 'SUBSCRIPTION') {
      return res.status(400).json({ error: 'Somente assinaturas podem ser ativadas ou canceladas.' });
    }

    const updated = await prisma.recurrence.update({
      where: { id: String(id) },
      data: { active: Boolean(active) },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar recorrência:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar recorrência.' });
  }
}

export async function deleteRecurrence(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!id) {
      return res.status(400).json({ error: 'ID da recorrência inválido.' });
    }

    const existing = await prisma.recurrence.findFirst({ where: { id: String(id), userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Recorrência não encontrada.' });
    }

    // onDelete: SetNull no schema mantém as transações já geradas; só para
    // de gerar novas.
    await prisma.recurrence.delete({ where: { id: String(id) } });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar recorrência:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar recorrência.' });
  }
}
