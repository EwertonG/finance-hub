import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories.js';
import { createHash, randomBytes } from 'node:crypto';
import { sendEmail } from '../lib/email.js';
import { getFrontendUrl } from '../config/origins.js';

/* Cadastro */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const userAlreadyExists = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
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
      data: DEFAULT_CATEGORIES.map((category, index) => ({
        ...category,
        userId: user.id,
        createdAt: new Date(user.createdAt.getTime() + index),
      })),
    });

    const token = generateToken({ userId: user.id, tokenVersion: 0 });

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

    const candidates = await prisma.user.findMany({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    let user = null;
    for (const candidate of candidates) {
      if (await comparePassword(password, candidate.passwordHash)) {
        user = candidate;
        break;
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos.' });
    }

    const token = generateToken({ userId: user.id, tokenVersion: user.tokenVersion });

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

    if (email) {
      const emailInUse = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' }, NOT: { id: userId } },
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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    if (await comparePassword(newPassword, user.passwordHash)) {
      return res.status(400).json({ error: SAME_PASSWORD_MESSAGE });
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
      select: { tokenVersion: true },
    });

    return res.json({ token: generateToken({ userId, tokenVersion: updated.tokenVersion }) });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    return res.status(500).json({ error: 'Erro interno ao trocar senha.' });
  }
}

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const SAME_PASSWORD_MESSAGE = 'A nova senha deve ser diferente da atual.';
const FORGOT_PASSWORD_MESSAGE =
  'Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.';
const INVALID_RESET_LINK_MESSAGE = 'Link inválido ou expirado. Solicite um novo.';

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function buildResetEmail(name: string, link: string) {
  const text = [
    `Olá, ${name}!`,
    '',
    'Recebemos um pedido para redefinir a senha da sua conta no CentralFinanças.',
    '',
    'Acesse o link abaixo para criar uma nova senha (válido por 30 minutos):',
    link,
    '',
    'Se você não fez esse pedido, ignore este e-mail. Sua senha continua a mesma.',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1E293B;">
      <h2 style="color: #047857;">Redefinição de senha</h2>
      <p>Olá, ${escapeHtml(name)}!</p>
      <p>Recebemos um pedido para redefinir a senha da sua conta no CentralFinanças.</p>
      <p>
        <a href="${link}" style="display: inline-block; padding: 12px 20px; background: #047857; color: #FFFFFF; text-decoration: none; border-radius: 8px;">
          Criar nova senha
        </a>
      </p>
      <p style="color: #64748B; font-size: 14px;">O link é válido por 30 minutos.</p>
      <p style="color: #64748B; font-size: 14px;">Se você não fez esse pedido, ignore este e-mail. Sua senha continua a mesma.</p>
    </div>
  `;

  return { text, html };
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const users = await prisma.user.findMany({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true, name: true, email: true },
    });

    for (const user of users) {
      const token = randomBytes(32).toString('hex');

      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        prisma.passwordResetToken.create({
          data: {
            tokenHash: hashResetToken(token),
            userId: user.id,
            expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
          },
        }),
      ]);

      const link = `${getFrontendUrl()}/reset-password?token=${token}`;
      const { text, html } = buildResetEmail(user.name, link);

      sendEmail({ to: user.email, subject: 'Redefinição de senha - CentralFinanças', text, html }).catch(
        (error) => console.error('Erro ao enviar e-mail de redefinição:', error)
      );
    }

    return res.json({ message: FORGOT_PASSWORD_MESSAGE });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return res.status(500).json({ error: 'Erro interno ao solicitar redefinição de senha.' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return res.status(400).json({ error: INVALID_RESET_LINK_MESSAGE });
    }

    const owner = await prisma.user.findUnique({
      where: { id: record.userId },
      select: { passwordHash: true },
    });
    if (owner && (await comparePassword(password, owner.passwordHash))) {
      return res.status(400).json({ error: SAME_PASSWORD_MESSAGE });
    }

    const passwordHash = await hashPassword(password);

    const reset = await prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });

      if (claimed.count === 0) return false;

      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash, tokenVersion: { increment: 1 } },
      });
      await tx.passwordResetToken.deleteMany({
        where: { userId: record.userId, id: { not: record.id } },
      });

      return true;
    });

    if (!reset) {
      return res.status(400).json({ error: INVALID_RESET_LINK_MESSAGE });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
  }
}
