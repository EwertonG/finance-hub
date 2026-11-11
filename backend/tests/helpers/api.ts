import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import { assertLocalDatabase } from '../setup/test-env.js';

export const api = request(app);

export async function resetDatabase() {
  assertLocalDatabase(process.env.DATABASE_URL ?? '');
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "credit_cards",
      "password_reset_tokens",
      "goal_contributions",
      "goals",
      "debtors",
      "transactions",
      "recurrences",
      "categories",
      "users"
    CASCADE
  `);
}

let userCounter = 0;

export async function createUser(overrides: { name?: string; email?: string; password?: string } = {}) {
  userCounter += 1;
  const credentials = {
    name: overrides.name ?? `Usuário ${userCounter}`,
    email: overrides.email ?? `usuario${userCounter}@teste.com`,
    password: overrides.password ?? 'Senha@123',
  };

  const response = await api.post('/auth/register').send(credentials);
  if (response.status !== 201) {
    throw new Error(`Falha ao criar usuário de teste: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const token: string = response.body.token;
  return {
    ...credentials,
    id: response.body.user.id as string,
    token,
    auth: { Authorization: `Bearer ${token}` },
  };
}

export type TestUser = Awaited<ReturnType<typeof createUser>>;

export async function findCategoryId(user: TestUser, name: string) {
  const response = await api.get('/categories').set(user.auth);
  const category = response.body.find((c: { name: string }) => c.name === name);
  if (!category) throw new Error(`Categoria "${name}" não encontrada`);
  return category.id as string;
}
