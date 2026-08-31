import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function createDebtor(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { 
      item, 
      totalAmount, 
      people, 
      mySplit = true, 
      categoryId, 
      date 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!item || totalAmount === undefined || !people || !Array.isArray(people) || people.length === 0) {
      return res.status(400).json({
        error: 'Descrição do item, valor total e uma lista com pelo menos 1 pessoa são obrigatórios.',
      });
    }

    const totalAmountNumber = Number(totalAmount);
    if (isNaN(totalAmountNumber) || totalAmountNumber <= 0) {
      return res.status(400).json({ error: 'O valor total deve ser um número positivo.' });
    }

    const numberOfFriends = people.length;
    const totalParts = mySplit ? numberOfFriends + 1 : numberOfFriends;
    
    // Valor individual para cada parte
    const individualAmount = Number((totalAmountNumber / totalParts).toFixed(2));
    const transactionDate = date ? new Date(date) : new Date();

    let createdTransaction = null;

    if (mySplit) {
      createdTransaction = await prisma.transaction.create({
        data: {
          description: `${item} (Minha parte - Divisão)`,
          amount: individualAmount,
          date: transactionDate,
          type: 'EXPENSE',
          userId,
          categoryId: categoryId ? String(categoryId) : null,
        },
      });
    }

    const createdDebtors = await Promise.all(
      people.map((personName: string) =>
        prisma.debtor.create({
          data: {
            personName: String(personName).trim(),
            item,
            amount: individualAmount,
            totalAmount: totalAmountNumber,
            status: 'PENDING',
            date: transactionDate,
            userId,
            transactionId: createdTransaction ? createdTransaction.id : null,
          },
        })
      )
    );

    return res.status(201).json({
      message: 'Cobrança(s) criada(s) com sucesso!',
      mySplit,
      myExpense: createdTransaction,
      debtors: createdDebtors,
    });
  } catch (error) {
    console.error('Erro ao criar registro de devedor:', error);
    return res.status(500).json({ error: 'Erro interno ao processar cobrança.' });
  }
}

// Com apenas "year" filtra o ano inteiro; com "month" e "year" filtra o mês
// específico. Mesmo padrão usado em transaction.controller.ts.
function buildDateFilter(month: unknown, year: unknown) {
  if (!year) return {};

  const parsedYear = parseInt(String(year), 10);
  const startDate = month
    ? new Date(parsedYear, parseInt(String(month), 10) - 1, 1)
    : new Date(parsedYear, 0, 1);
  const endDate = month
    ? new Date(parsedYear, parseInt(String(month), 10), 0, 23, 59, 59, 999)
    : new Date(parsedYear, 11, 31, 23, 59, 59, 999);

  return {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };
}

export async function listDebtors(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { status, month, year, page, limit } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const validStatuses = ['PENDING', 'CHARGED', 'PAID'];
    const statusFilter = status && validStatuses.includes(String(status))
      ? { status: String(status) as any }
      : {};

    const where = {
      userId,
      ...statusFilter,
      ...buildDateFilter(month, year),
    };

    const parsedLimit = limit ? parseInt(String(limit), 10) : undefined;
    const parsedPage = Math.max(1, page ? parseInt(String(page), 10) : 1);

    const [debtors, total] = await Promise.all([
      prisma.debtor.findMany({
        where,
        include: {
          transaction: {
            select: {
              id: true,
              description: true,
              amount: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        ...(parsedLimit ? { skip: (parsedPage - 1) * parsedLimit, take: parsedLimit } : {}),
      }),
      prisma.debtor.count({ where }),
    ]);

    return res.json({
      data: debtors,
      total,
      page: parsedLimit ? parsedPage : 1,
      limit: parsedLimit ?? null,
      totalPages: parsedLimit ? Math.ceil(total / parsedLimit) : 1,
    });
  } catch (error) {
    console.error('Erro ao listar devedores:', error);
    return res.status(500).json({ error: 'Erro interno ao listar devedores.' });
  }
}

export async function getDebtorsSummary(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const debtors = await prisma.debtor.findMany({
      where: {
        userId,
        ...buildDateFilter(month, year),
      },
    });

    let totalPending = 0;
    let totalCharged = 0;
    let totalPaid = 0;

    debtors.forEach((debtor:any) => {
      const amountNumber = Number(debtor.amount);
      const debtorStatus = String(debtor.status);

      if (debtorStatus === 'PENDING') {
        totalPending += amountNumber;
      } else if (debtorStatus === 'CHARGED') {
        totalCharged += amountNumber;
      } else if (debtorStatus === 'PAID') {
        totalPaid += amountNumber;
      }
    });

    return res.json({
      totalPending: Number(totalPending.toFixed(2)),
      totalCharged: Number(totalCharged.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalToReceive: Number((totalPending + totalCharged).toFixed(2)), // O que ainda não caiu no Pix
      totalOverall: Number((totalPending + totalCharged + totalPaid).toFixed(2)),
    });
  } catch (error) {
    console.error('Erro ao calcular resumo de cobranças:', error);
    return res.status(500).json({ error: 'Erro interno ao calcular resumo.' });
  }
}

export async function updateDebtor(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { personName, item, amount, status, date } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID do devedor inválido.' });
    }

    const existingDebtor = await prisma.debtor.findFirst({
      where: {
        id: String(id),
        userId,
      },
    });

    if (!existingDebtor) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }

    const updatedDebtor = await prisma.debtor.update({
      where: { id: String(id) },
      data: {
        ...(personName ? { personName: String(personName).trim() } : {}),
        ...(item ? { item } : {}),
        ...(amount !== undefined ? { amount: Number(amount) } : {}),
        ...(status && ['PENDING', 'CHARGED', 'PAID'].includes(status) ? { status } : {}),
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    return res.json(updatedDebtor);
  } catch (error) {
    console.error('Erro ao atualizar registro de devedor:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar devedor.' });
  }
}

export async function deleteDebtor(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const existingDebtor = await prisma.debtor.findFirst({
      where: {
        id: String(id),
        userId,
      },
    });

    if (!existingDebtor) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }

    await prisma.debtor.delete({
      where: { id: String(id) },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar devedor:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar devedor.' });
  }
}