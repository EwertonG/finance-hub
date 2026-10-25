import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../lib/prisma.js';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  // separar bearer do token
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
  }

  const token = parts[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { tokenVersion: true },
  });

  if (!user || (decoded.tokenVersion ?? 0) !== user.tokenVersion) {
    return res.status(401).json({ error: 'Sessão encerrada. Faça login novamente.' });
  }

  req.userId = decoded.userId;
  return next();
}