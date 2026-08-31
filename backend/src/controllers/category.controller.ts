import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function createCategory(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { name, color, icon, type } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!name || !type) {
      return res.status(400).json({ error: 'Nome e tipo (INCOME ou EXPENSE) são obrigatórios.' });
    }

    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({ error: 'O tipo deve ser INCOME ou EXPENSE.' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#6B7280',
        icon: icon || 'MoreHorizRounded',
        type,
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
    const { type } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const categories = await prisma.category.findMany({
      where: {
        userId,
        ...(type && (type === 'INCOME' || type === 'EXPENSE') ? { type } : {}),
      },
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
    const { name, color, icon, type } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
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

    const updatedCategory = await prisma.category.update({
      where: { 
        id: String(id) 
    },
      data: {
        ...(name ? { name } : {}),
        ...(color ? { color } : {}),
        ...(icon ? { icon } : {}),
        ...(type && (type === 'INCOME' || type === 'EXPENSE') ? { type } : {}),
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