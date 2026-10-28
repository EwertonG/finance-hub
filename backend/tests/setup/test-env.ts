export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:test@localhost:5433/finance_hub_test';

export const testEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: TEST_DATABASE_URL,
  JWT_SECRET: 'test-only-secret-with-more-than-32-characters',
  CORS_ORIGINS: 'http://localhost:5173',
  BREVO_API_KEY: '',
  EMAIL_FROM: '',
  API_DOCS_ENABLED: 'false',
};

export function assertLocalDatabase(url: string) {
  const host = new URL(url).hostname;
  if (!['localhost', '127.0.0.1'].includes(host)) {
    throw new Error(
      `Os testes apagam todos os dados do banco e só rodam em um banco local. Host recebido: "${host}".`
    );
  }
}
