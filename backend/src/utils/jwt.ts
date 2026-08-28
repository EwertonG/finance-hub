import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
  throw new Error(
    'JWT_SECRET não definido. Configure a variável de ambiente antes de iniciar o servidor.'
  );
})();

const JWT_EXPIRES_IN = '7d';

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