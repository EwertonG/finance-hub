import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

function summarizeGoal(goal: { targetAmount: unknown }, currentAmount: number) {
  const targetAmount = Number(goal.targetAmount);
  const progress = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;

  return {
    currentAmount: Number(currentAmount.toFixed(2)),
    progress: Number(progress.toFixed(1)),
    completed: currentAmount >= targetAmount,
  };
}

export async function createGoal(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { name, targetAmount, targetDate, color } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!name || targetAmount === undefined) {
      return res.status(400).json({ error: 'Nome e valor alvo são obrigatórios.' });
    }

    const targetAmountNumber = Number(targetAmount);
    if (isNaN(targetAmountNumber) || targetAmountNumber <= 0) {
      return res.status(400).json({ error: 'O valor alvo deve ser um número positivo.' });
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        targetAmount: targetAmountNumber,
        targetDate: targetDate ? new Date(targetDate) : null,
        color: color || '#047857',
        userId,
      },
    });

    return res.status(201).json({ ...goal, currentAmount: 0, progress: 0, completed: false });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    return res.status(500).json({ error: 'Erro interno ao criar meta.' });
  }
}

export async function listGoals(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const contributionTotals = await prisma.goalContribution.groupBy({
      by: ['goalId', 'type'],
      where: { goalId: { in: goals.map((g) => g.id) } },
      _sum: { amount: true },
    });

    const currentAmountByGoal = new Map<string, number>();
    contributionTotals.forEach((t) => {
      const amount = Number(t._sum.amount ?? 0);
      const delta = t.type === 'DEPOSIT' ? amount : -amount;
      currentAmountByGoal.set(t.goalId, (currentAmountByGoal.get(t.goalId) ?? 0) + delta);
    });

    const goalsWithSummary = goals.map((goal) => ({
      ...goal,
      ...summarizeGoal(goal, currentAmountByGoal.get(goal.id) ?? 0),
    }));

    return res.json(goalsWithSummary);
  } catch (error) {
    console.error('Erro ao listar metas:', error);
    return res.status(500).json({ error: 'Erro interno ao listar metas.' });
  }
}

export async function updateGoal(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, targetAmount, targetDate, color } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const existing = await prisma.goal.findFirst({ where: { id: String(id), userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Meta não encontrada.' });
    }

    if (targetAmount !== undefined && Number(targetAmount) <= 0) {
      return res.status(400).json({ error: 'O valor alvo deve ser um número positivo.' });
    }

    const updated = await prisma.goal.update({
      where: { id: String(id) },
      data: {
        ...(name ? { name } : {}),
        ...(targetAmount !== undefined ? { targetAmount: Number(targetAmount) } : {}),
        ...(targetDate !== undefined ? { targetDate: targetDate ? new Date(targetDate) : null } : {}),
        ...(color ? { color } : {}),
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar meta.' });
  }
}

export async function deleteGoal(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const existing = await prisma.goal.findFirst({ where: { id: String(id), userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Meta não encontrada.' });
    }

    // Cascade remove as contribuições junto: diferente de Recurrence, uma
    // contribuição não tem sentido sem a meta que ela alimenta.
    await prisma.goal.delete({ where: { id: String(id) } });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar meta.' });
  }
}

export async function createContribution(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { amount, type, note } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const goal = await prisma.goal.findFirst({ where: { id: String(id), userId } });
    if (!goal) {
      return res.status(404).json({ error: 'Meta não encontrada.' });
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: 'O valor deve ser um número positivo.' });
    }

    if (type !== 'DEPOSIT' && type !== 'WITHDRAWAL') {
      return res.status(400).json({ error: 'type deve ser DEPOSIT ou WITHDRAWAL.' });
    }

    const contribution = await prisma.goalContribution.create({
      data: {
        amount: amountNumber,
        type,
        note: note || null,
        goalId: goal.id,
        userId,
      },
    });

    return res.status(201).json(contribution);
  } catch (error) {
    console.error('Erro ao registrar contribuição:', error);
    return res.status(500).json({ error: 'Erro interno ao registrar contribuição.' });
  }
}

export async function listContributions(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const goal = await prisma.goal.findFirst({ where: { id: String(id), userId } });
    if (!goal) {
      return res.status(404).json({ error: 'Meta não encontrada.' });
    }

    const contributions = await prisma.goalContribution.findMany({
      where: { goalId: goal.id },
      orderBy: { date: 'desc' },
    });

    return res.json(contributions);
  } catch (error) {
    console.error('Erro ao listar contribuições:', error);
    return res.status(500).json({ error: 'Erro interno ao listar contribuições.' });
  }
}

export async function deleteContribution(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id, contributionId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const contribution = await prisma.goalContribution.findFirst({
      where: { id: String(contributionId), goalId: String(id), userId },
    });

    if (!contribution) {
      return res.status(404).json({ error: 'Contribuição não encontrada.' });
    }

    await prisma.goalContribution.delete({ where: { id: contribution.id } });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar contribuição:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar contribuição.' });
  }
}
