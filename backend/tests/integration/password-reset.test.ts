import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, resetDatabase, createUser } from '../helpers/api.js';
import { prisma } from '../../src/lib/prisma.js';

const sentEmails = vi.hoisted(() => [] as { to: string; text: string }[]);

vi.mock('../../src/lib/email.js', () => ({
  sendEmail: vi.fn(async (email: { to: string; text: string }) => {
    sentEmails.push(email);
  }),
}));

function lastResetToken() {
  const text = sentEmails.at(-1)?.text ?? '';
  return text.match(/reset-password\?token=([0-9a-f]+)/)?.[1] ?? '';
}

beforeEach(async () => {
  await resetDatabase();
  sentEmails.length = 0;
});

describe('esqueci minha senha', () => {
  it('envia o link e permite criar uma nova senha', async () => {
    const user = await createUser({ email: 'ana@teste.com' });

    const request = await api.post('/auth/forgot-password').send({ email: 'ANA@teste.com' });
    expect(request.status).toBe(200);
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe('ana@teste.com');

    const reset = await api.post('/auth/reset-password').send({ token: lastResetToken(), password: 'Nova@1234' });
    expect(reset.status).toBe(204);

    const oldLogin = await api.post('/auth/login').send({ email: user.email, password: user.password });
    const newLogin = await api.post('/auth/login').send({ email: user.email, password: 'Nova@1234' });
    expect(oldLogin.status).toBe(400);
    expect(newLogin.status).toBe(200);

    const oldSession = await api.get('/auth/me').set(user.auth);
    expect(oldSession.status).toBe(401);
  });

  it('responde igual para e-mail inexistente, sem enviar nada', async () => {
    await createUser({ email: 'ana@teste.com' });

    const existing = await api.post('/auth/forgot-password').send({ email: 'ana@teste.com' });
    const missing = await api.post('/auth/forgot-password').send({ email: 'ninguem@teste.com' });

    expect(missing.status).toBe(existing.status);
    expect(missing.body).toEqual(existing.body);
    expect(sentEmails).toHaveLength(1);
  });

  it('o link só pode ser usado uma vez', async () => {
    await createUser({ email: 'ana@teste.com' });
    await api.post('/auth/forgot-password').send({ email: 'ana@teste.com' });
    const token = lastResetToken();

    await api.post('/auth/reset-password').send({ token, password: 'Nova@1234' });
    const reuse = await api.post('/auth/reset-password').send({ token, password: 'Outra@1234' });

    expect(reuse.status).toBe(400);
    expect(reuse.body.error).toBe('Link inválido ou expirado. Solicite um novo.');
  });

  it('pedir um link novo invalida o anterior', async () => {
    await createUser({ email: 'ana@teste.com' });
    await api.post('/auth/forgot-password').send({ email: 'ana@teste.com' });
    const firstToken = lastResetToken();
    await api.post('/auth/forgot-password').send({ email: 'ana@teste.com' });

    const response = await api.post('/auth/reset-password').send({ token: firstToken, password: 'Nova@1234' });
    expect(response.status).toBe(400);
  });

  it('o link expira', async () => {
    await createUser({ email: 'ana@teste.com' });
    await api.post('/auth/forgot-password').send({ email: 'ana@teste.com' });
    await prisma.passwordResetToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });

    const response = await api.post('/auth/reset-password').send({ token: lastResetToken(), password: 'Nova@1234' });
    expect(response.status).toBe(400);
  });

  it('o banco guarda só o hash do token, nunca o token', async () => {
    await createUser({ email: 'ana@teste.com' });
    await api.post('/auth/forgot-password').send({ email: 'ana@teste.com' });

    const stored = await prisma.passwordResetToken.findFirstOrThrow();
    expect(stored.tokenHash).not.toBe(lastResetToken());
    expect(stored.tokenHash).toHaveLength(64);
  });
});
