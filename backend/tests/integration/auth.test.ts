import { describe, it, expect, beforeEach } from 'vitest';
import { api, resetDatabase, createUser } from '../helpers/api.js';

beforeEach(resetDatabase);

describe('cadastro e login', () => {
  it('cria a conta com as 7 categorias padrão, sempre na mesma ordem', async () => {
    const user = await createUser();

    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await api.get('/categories').set(user.auth);
      expect(response.status).toBe(200);
      expect(response.body.map((c: { name: string }) => c.name)).toEqual([
        'Alimentação',
        'Aluguel',
        'Transporte',
        'Lazer',
        'Saúde',
        'Salário',
        'Outros',
      ]);
    }
  });

  it('não permite dois cadastros com o mesmo e-mail, mesmo mudando maiúsculas', async () => {
    await createUser({ email: 'ana@teste.com' });
    const response = await api
      .post('/auth/register')
      .send({ name: 'Outra Ana', email: ' ANA@Teste.com ', password: 'Senha@123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Este e-mail já está cadastrado.');
  });

  it('faz login com o e-mail em qualquer caixa', async () => {
    await createUser({ email: 'ana@teste.com' });
    const response = await api.post('/auth/login').send({ email: 'Ana@Teste.com', password: 'Senha@123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });

  it('recusa senha errada', async () => {
    await createUser({ email: 'ana@teste.com' });
    const response = await api.post('/auth/login').send({ email: 'ana@teste.com', password: 'Errada@123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('E-mail ou senha inválidos.');
  });

  it('rotas protegidas exigem token', async () => {
    const response = await api.get('/transactions');
    expect(response.status).toBe(401);
  });
});

describe('troca de senha', () => {
  it('derruba as outras sessões e mantém quem trocou logado', async () => {
    const user = await createUser();
    const otherSession = await api.post('/auth/login').send({ email: user.email, password: user.password });

    const change = await api
      .put('/auth/me/password')
      .set(user.auth)
      .send({ currentPassword: user.password, newPassword: 'Nova@1234' });
    expect(change.status).toBe(200);

    const oldToken = await api.get('/auth/me').set(user.auth);
    const otherToken = await api.get('/auth/me').set({ Authorization: `Bearer ${otherSession.body.token}` });
    const newToken = await api.get('/auth/me').set({ Authorization: `Bearer ${change.body.token}` });

    expect(oldToken.status).toBe(401);
    expect(otherToken.status).toBe(401);
    expect(newToken.status).toBe(200);
  });

  it('recusa a nova senha igual à atual', async () => {
    const user = await createUser();
    const response = await api
      .put('/auth/me/password')
      .set(user.auth)
      .send({ currentPassword: user.password, newPassword: user.password });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('A nova senha deve ser diferente da atual.');
    expect((await api.get('/auth/me').set(user.auth)).status).toBe(200);
  });

  it('exige a senha atual correta', async () => {
    const user = await createUser();
    const response = await api
      .put('/auth/me/password')
      .set(user.auth)
      .send({ currentPassword: 'Errada@123', newPassword: 'Nova@1234' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Senha atual incorreta.');
  });
});

describe('limite de tentativas de login', () => {
  it('bloqueia depois de 10 tentativas erradas', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'rate-limit-test';
    try {
      await createUser({ email: 'alvo@teste.com' });
      const attempts = [];
      for (let i = 0; i < 11; i++) {
        attempts.push(await api.post('/auth/login').send({ email: 'alvo@teste.com', password: 'Errada@123' }));
      }

      expect(attempts.slice(0, 10).every((r) => r.status === 400)).toBe(true);
      expect(attempts[10].status).toBe(429);
    } finally {
      process.env.NODE_ENV = previousEnv;
    }
  });
});
