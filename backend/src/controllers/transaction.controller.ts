import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function createTransaction(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { description, amount, date, type, categoryId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!description || amount === undefined || !date || !type) {
      return res.status(400).json({
        error: 'Descrição, valor, data e tipo (INCOME ou EXPENSE) são obrigatórios.',
      });
    }

    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({ error: 'O tipo deve ser INCOME ou EXPENSE.' });
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findFirst({
        where: {
          id: String(categoryId),
          userId,
        },
      });

      if (!categoryExists) {
        return res.status(400).json({ error: 'Categoria informada não existe ou não pertence a este usuário.' });
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: Number(amount),
        date: new Date(date),
        type,
        userId,
        categoryId: categoryId ? String(categoryId) : null,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return res.status(500).json({ error: 'Erro interno ao criar lançamento.' });
  }
}

export async function listTransactions(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { month, year, type, categoryId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    let dateFilter = {};
    if (month && year) {
      const parsedMonth = parseInt(String(month), 10);
      const parsedYear = parseInt(String(year), 10);

      const startDate = new Date(parsedYear, parsedMonth - 1, 1);
      const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59, 999);

      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...dateFilter,
        ...(type && (type === 'INCOME' || type === 'EXPENSE') ? { type } : {}),
        ...(categoryId ? { categoryId: String(categoryId) } : {}),
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return res.json(transactions);
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    return res.status(500).json({ error: 'Erro interno ao listar lançamentos.' });
  }
}

export async function getTransactionSummary(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const currentYear = year ? parseInt(String(year), 10) : new Date().getFullYear();
    const currentMonth = month ? parseInt(String(month), 10) : new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      const amountNumber = Number(tx.amount);
      if (tx.type === 'INCOME') {
        totalIncome += amountNumber;
      } else {
        totalExpense += amountNumber;
      }
    });

    const balance = totalIncome - totalExpense;

    return res.json({
      month: currentMonth,
      year: currentYear,
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      balance: Number(balance.toFixed(2)),
    });
  } catch (error) {
    console.error('Erro ao calcular resumo financeiro:', error);
    return res.status(500).json({ error: 'Erro interno ao calcular resumo.' });
  }
}

export async function getAnnualSummary(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { year } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const currentYear = year ? parseInt(String(year), 10) : new Date().getFullYear();

    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Inicializa os 12 meses com totais zerados para que o gráfico do
    // frontend sempre receba um array completo, mesmo sem lançamentos.
    const months = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    }));

    transactions.forEach((tx) => {
      const monthIndex = tx.date.getMonth();
      const amountNumber = Number(tx.amount);

      if (tx.type === 'INCOME') {
        months[monthIndex].totalIncome += amountNumber;
      } else {
        months[monthIndex].totalExpense += amountNumber;
      }
    });

    months.forEach((m) => {
      m.totalIncome = Number(m.totalIncome.toFixed(2));
      m.totalExpense = Number(m.totalExpense.toFixed(2));
      m.balance = Number((m.totalIncome - m.totalExpense).toFixed(2));
    });

    return res.json({
      year: currentYear,
      months,
    });
  } catch (error) {
    console.error('Erro ao calcular resumo anual:', error);
    return res.status(500).json({ error: 'Erro interno ao calcular resumo anual.' });
  }
}

export async function updateTransaction(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { description, amount, date, type, categoryId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID do lançamento inválido.' });
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: String(id),
        userId,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Lançamento não encontrado.' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: String(id),
      },
      data: {
        ...(description ? { description } : {}),
        ...(amount !== undefined ? { amount: Number(amount) } : {}),
        ...(date ? { date: new Date(date) } : {}),
        ...(type && (type === 'INCOME' || type === 'EXPENSE') ? { type } : {}),
        ...(categoryId !== undefined ? { categoryId: categoryId ? String(categoryId) : null } : {}),
      },
      include: {
        category: true,
      },
    });

    return res.json(updatedTransaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar transação.' });
  }
}

export async function deleteTransaction(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID do lançamento inválido.' });
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: String(id),
        userId,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Lançamento não encontrado.' });
    }

    await prisma.transaction.delete({
      where: {
        id: String(id),
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar transação.' });
  }
}