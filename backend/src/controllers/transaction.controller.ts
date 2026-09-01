import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ensureSubscriptionTransactions } from '../lib/recurrence.js';
import { buildDateFilter } from '../lib/dateFilter.js';

const PAYMENT_METHODS = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH'];

export async function createTransaction(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { description, amount, date, type, categoryId, paymentMethod } = req.body;

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

    if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Forma de pagamento inválida.' });
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
        paymentMethod: paymentMethod || null,
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
    const { month, year, type, categoryId, page, limit } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    await ensureSubscriptionTransactions(userId);

    const where = {
      userId,
      ...buildDateFilter(month, year),
      ...(type && (type === 'INCOME' || type === 'EXPENSE') ? { type: type as 'INCOME' | 'EXPENSE' } : {}),
      ...(categoryId ? { categoryId: String(categoryId) } : {}),
    };

    // "limit" ausente = sem paginação (usado pelo Dashboard, que precisa do
    // conjunto inteiro para os gráficos).
    const parsedLimit = limit ? parseInt(String(limit), 10) : undefined;
    const parsedPage = Math.max(1, page ? parseInt(String(page), 10) : 1);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, color: true, icon: true } },
          recurrence: { select: { kind: true, installmentTotal: true } },
        },
        orderBy: { date: 'desc' },
        ...(parsedLimit ? { skip: (parsedPage - 1) * parsedLimit, take: parsedLimit } : {}),
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.json({
      data: transactions,
      total,
      page: parsedLimit ? parsedPage : 1,
      limit: parsedLimit ?? null,
      totalPages: parsedLimit ? Math.ceil(total / parsedLimit) : 1,
    });
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

    await ensureSubscriptionTransactions(userId);

    const currentYear = year ? parseInt(String(year), 10) : new Date().getFullYear();
    const currentMonth = month ? parseInt(String(month), 10) : new Date().getMonth() + 1;

    // UTC: datas são armazenadas em UTC-meia-noite (ver lib/recurrence.ts).
    const startDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const endDate = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));

    const totals = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
    });

    const totalIncome = Number(totals.find((t) => t.type === 'INCOME')?._sum.amount ?? 0);
    const totalExpense = Number(totals.find((t) => t.type === 'EXPENSE')?._sum.amount ?? 0);
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

    await ensureSubscriptionTransactions(userId);

    const currentYear = year ? parseInt(String(year), 10) : new Date().getFullYear();

    // UTC: datas são armazenadas em UTC-meia-noite (ver lib/recurrence.ts).
    const startDate = new Date(Date.UTC(currentYear, 0, 1));
    const endDate = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

    // Agregado no banco (SUM + GROUP BY mês/tipo) em vez de trazer o ano
    // inteiro de transações para somar em JS.
    const rows = await prisma.$queryRaw<Array<{ month: number; type: 'INCOME' | 'EXPENSE'; total: string | number }>>(
      Prisma.sql`
        SELECT EXTRACT(MONTH FROM date)::int AS month, type, SUM(amount) AS total
        FROM transactions
        WHERE user_id = ${userId} AND date >= ${startDate} AND date <= ${endDate}
        GROUP BY month, type
      `
    );

    // Inicializa os 12 meses com totais zerados para que o gráfico do
    // frontend sempre receba um array completo, mesmo sem lançamentos.
    const months = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    }));

    rows.forEach((row) => {
      const monthIndex = row.month - 1;
      const amountNumber = Number(row.total);

      if (row.type === 'INCOME') {
        months[monthIndex].totalIncome = amountNumber;
      } else {
        months[monthIndex].totalExpense = amountNumber;
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
    const { description, amount, date, type, categoryId, paymentMethod } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID do lançamento inválido.' });
    }

    if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Forma de pagamento inválida.' });
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
        ...(paymentMethod !== undefined ? { paymentMethod: paymentMethod || null } : {}),
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

// Segue o mesmo período (month/year) selecionado no dashboard, somando no
// banco por categoria em vez de trazer as transações inteiras para agrupar
// em JS.
export async function getCategoryBreakdown(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const totals = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', ...buildDateFilter(month, year) },
      _sum: { amount: true },
    });

    const categoryIds = totals.map((t) => t.categoryId).filter((id): id is string => id !== null);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });
    const categoryById = new Map(categories.map((c) => [c.id, c]));

    const breakdown = totals.map((t) => {
      const category = t.categoryId ? categoryById.get(t.categoryId) : undefined;
      return {
        categoryId: t.categoryId,
        name: category?.name ?? 'Sem categoria',
        color: category?.color ?? '#6B7280',
        icon: category?.icon ?? 'MoreHorizRounded',
        amount: Number(t._sum.amount ?? 0),
      };
    });

    return res.json(breakdown);
  } catch (error) {
    console.error('Erro ao calcular gastos por categoria:', error);
    return res.status(500).json({ error: 'Erro interno ao calcular gastos por categoria.' });
  }
}

// Mesmo período selecionado no dashboard (mês/ano), soma no banco por forma
// de pagamento — "fatura do cartão" e "saldo em débito" são exatamente essa
// soma de despesas do período por método.
export async function getPaymentMethodBreakdown(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const totals = await prisma.transaction.groupBy({
      by: ['paymentMethod'],
      where: { userId, type: 'EXPENSE', ...buildDateFilter(month, year) },
      _sum: { amount: true },
    });

    const totalsByMethod = new Map<string, number>(
      totals.map((t) => [t.paymentMethod ?? '', Number(t._sum.amount ?? 0)])
    );

    const breakdown = PAYMENT_METHODS.map((method) => ({
      paymentMethod: method,
      amount: totalsByMethod.get(method) ?? 0,
    }));

    return res.json(breakdown);
  } catch (error) {
    console.error('Erro ao calcular gastos por forma de pagamento:', error);
    return res.status(500).json({ error: 'Erro interno ao calcular gastos por forma de pagamento.' });
  }
}

// Usado pelo gráfico de evolução do dashboard para não mostrar meses
// anteriores ao primeiro lançamento (a conta pode ter sido criada bem antes
// do usuário começar a registrar gastos de fato).
export async function getFirstTransactionDate(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const first = await prisma.transaction.findFirst({
      where: { userId },
      orderBy: { date: 'asc' },
      select: { date: true },
    });

    return res.json({ date: first?.date ?? null });
  } catch (error) {
    console.error('Erro ao buscar primeiro lançamento:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar primeiro lançamento.' });
  }
}