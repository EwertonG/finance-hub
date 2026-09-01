import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories.js';

/* Cadastro */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({ ...category, userId: user.id })),
    });

    const token = generateToken({ userId: user.id });

    return res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
}

/* Login */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
    }

    const token = generateToken({ userId: user.id });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { name, email } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }

    if (!name && !email) {
      return res.status(400).json({ error: 'Informe nome e/ou e-mail para atualizar.' });
    }

    if (email) {
      const emailInUse = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });

      if (emailInUse) {
        return res.status(400).json({ error: 'Este e-mail já está em uso por outra conta.' });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return res.json({ user });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    return res.status(500).json({ error: 'Erro interno ao trocar senha.' });
  }
}