import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { parsePositiveAmount } from '../lib/amount.js';

const DUPLICATE_NAME_ERROR = 'Já existe uma categoria com esse nome.';

async function nameInUse(userId: string, name: string, ignoreId?: string) {
  const existing = await prisma.category.findFirst({
    where: {
      userId,
      name: { equals: name, mode: 'insensitive' },
      ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
    },
    select: { id: true },
  });
  return existing !== null;
}

export async function createCategory(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { color, icon, budget } = req.body;
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!name) {
      return res.status(400).json({ error: 'O nome é obrigatório.' });
    }

    if (budget && parsePositiveAmount(budget) === null) {
      return res.status(400).json({ error: 'O orçamento deve ser um número positivo.' });
    }

    if (await nameInUse(userId, name)) {
      return res.status(400).json({ error: DUPLICATE_NAME_ERROR });
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#6B7280',
        icon: icon || 'MoreHorizRounded',
        budget: budget ? Number(budget) : null,
        userId,
      },
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return res.status(500).json({ error: 'Erro interno ao criar categoria.' });
  }
}

export async function listCategories(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return res.status(500).json({ error: 'Erro interno ao listar categorias.' });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { color, icon, budget } = req.body;
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (budget && parsePositiveAmount(budget) === null) {
      return res.status(400).json({ error: 'O orçamento deve ser um número positivo.' });
    }

    const existingCategory = await prisma.category.findFirst({
      where: { 
            id: String (id), 
            userId 
        },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    if (name && (await nameInUse(userId, name, existingCategory.id))) {
      return res.status(400).json({ error: DUPLICATE_NAME_ERROR });
    }

    const updatedCategory = await prisma.category.update({
      where: { 
        id: String(id) 
    },
      data: {
        ...(name ? { name } : {}),
        ...(color ? { color } : {}),
        ...(icon ? { icon } : {}),
        ...(budget !== undefined ? { budget: budget ? Number(budget) : null } : {}),
      },
    });

    return res.json(updatedCategory);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar categoria.' });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const existingCategory = await prisma.category.findFirst({
      where: { 
        id: String(id), 
        userId 
        },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    await prisma.category.delete({
      where: { 
        id: String(id) 
    },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar categoria.' });
  }
}