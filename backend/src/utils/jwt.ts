import jwt from 'jsonwebtoken';

const PUBLIC_SECRETS = new Set([
  'finance_hub_default_secret_key_2026',
  'finance_hub_super_secret_jwt_key_2026_homo',
  'central_financas_super_secret_jwt_key_2026_homo',
  'troque-por-um-valor-aleatorio-de-pelo-menos-32-caracteres',
]);
const MIN_SECRET_LENGTH = 32;

function loadJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET não definido. Configure a variável de ambiente antes de iniciar o servidor.'
    );
  }

  if (PUBLIC_SECRETS.has(secret)) {
    throw new Error('JWT_SECRET usa um valor público do repositório. Gere um novo segredo.');
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET deve ter pelo menos ${MIN_SECRET_LENGTH} caracteres.`);
  }

  return secret;
}

const JWT_SECRET = loadJwtSecret();

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