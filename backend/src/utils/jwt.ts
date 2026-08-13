import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'finance_hub_default_secret_key_2026';
const JWT_EXPIRES_IN = '7d'; // Token válido por 7 dias

interface TokenPayload {
  userId: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}