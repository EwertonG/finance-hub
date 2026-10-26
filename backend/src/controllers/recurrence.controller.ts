import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ensureSubscriptionTransactions, subscriptionPeriod } from '../lib/recurrence.js';
import { userOwnsCategory, CATEGORY_NOT_OWNED_ERROR } from '../lib/category.js';
import { splitAmount } from '../lib/money.js';

export async function createRecurrence(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const {
      description,
      type,
      categoryId,
      startDate,
      kind,
      installmentTotal,
      totalAmount,
      amount,
      startInstallmentNumber,
      paymentMethod,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (categoryId && !(await userOwnsCategory(userId, categoryId))) {
      return res.status(400).json({ error: CATEGORY_NOT_OWNED_ERROR });
    }

    const start: Date = startDate;

    if (kind === 'INSTALLMENT') {
      const total: number = installmentTotal;
      const totalAmountNumber: number = totalAmount;

      // Permite registrar uma compra parcelada que já está em andamento (ex:
      // parcelou antes de usar o app, já está na parcela 8 de 10): só gera
      // as parcelas a partir da informada, sem recriar as anteriores.
      const startInstallment: number = startInstallmentNumber;

      const installmentAmounts = splitAmount(totalAmountNumber, total);
      const installmentAmount = installmentAmounts[0];

      const startYear = start.getUTCFullYear();
      const startMonth = start.getUTCMonth();
      const startDay = start.getUTCDate();
      const remainingInstallments = total - startInstallment + 1;

      const recurrence = await prisma.$transaction(async (tx) => {
        const created = await tx.recurrence.create({
          data: {
            description,
            amount: installmentAmount,
            type,
            kind: 'INSTALLMENT',
            startDate: start,
            installmentTotal: total,
            userId,
            categoryId: categoryId ? String(categoryId) : null,
            paymentMethod: paymentMethod || null,
          },
        });

        // Parcelas restantes (a partir de startInstallment) são criadas de uma
        // vez, já que o total é conhecido de antemão (diferente da assinatura,
        // que não tem fim). Datas são UTC-meia-noite; usar getters locais
        // deslocaria o dia.
        await tx.transaction.createMany({
          data: Array.from({ length: remainingInstallments }, (_, i) => {
            const month = startMonth + i;
            const daysInMonth = new Date(Date.UTC(startYear, month + 1, 0)).getUTCDate();
            return {
              description,
              amount: installmentAmounts[startInstallment + i - 1],
              date: new Date(Date.UTC(startYear, month, Math.min(startDay, daysInMonth))),
              type,
              userId,
              categoryId: categoryId ? String(categoryId) : null,
              paymentMethod: paymentMethod || null,
              recurrenceId: created.id,
              installmentNumber: startInstallment + i,
            };
          }),
        });

        return created;
      });

      return res.status(201).json(recurrence);
    }

    // SUBSCRIPTION
    const amountNumber: number = amount;

    const recurrence = await prisma.recurrence.create({
      data: {
        description,
        amount: amountNumber,
        type,
        kind: 'SUBSCRIPTION',
        startDate: start,
        userId,
        categoryId: categoryId ? String(categoryId) : null,
        paymentMethod: paymentMethod || null,
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

    const reactivating = active && !existing.active;

    const updated = await prisma.recurrence.update({
      where: { id: String(id) },
      data: {
        active,
        ...(reactivating
          ? {
              lastGeneratedPeriod: Math.max(
                existing.lastGeneratedPeriod,
                subscriptionPeriod(existing.startDate) - 1
              ),
            }
          : {}),
      },
    });

    if (reactivating) {
      await ensureSubscriptionTransactions(userId, true);
    }

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
