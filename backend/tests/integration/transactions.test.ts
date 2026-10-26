import { describe, it, expect, beforeEach } from 'vitest';
import { api, resetDatabase, createUser, findCategoryId } from '../helpers/api.js';

beforeEach(resetDatabase);

describe('lançamentos', () => {
  it('cria, lista e resume os lançamentos do mês', async () => {
    const user = await createUser();
    const food = await findCategoryId(user, 'Alimentação');

    await api.post('/transactions').set(user.auth).send({ description: 'Salário', amount: 5000, type: 'INCOME', date: '2026-10-05' });
    await api.post('/transactions').set(user.auth).send({ description: 'Mercado', amount: 350.5, type: 'EXPENSE', date: '2026-10-10', categoryId: food });
    await api.post('/transactions').set(user.auth).send({ description: 'Outro mês', amount: 100, type: 'EXPENSE', date: '2026-09-30' });

    const list = await api.get('/transactions?month=10&year=2026').set(user.auth);
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(2);

    const summary = await api.get('/transactions/summary?month=10&year=2026').set(user.auth);
    expect(summary.body).toMatchObject({ totalIncome: 5000, totalExpense: 350.5, balance: 4649.5 });
  });

  it('o último dia do mês entra no filtro daquele mês', async () => {
    const user = await createUser();
    await api.post('/transactions').set(user.auth).send({ description: 'Fim do mês', amount: 10, type: 'EXPENSE', date: '2026-10-31' });

    const october = await api.get('/transactions?month=10&year=2026').set(user.auth);
    const november = await api.get('/transactions?month=11&year=2026').set(user.auth);
    expect(october.body.total).toBe(1);
    expect(november.body.total).toBe(0);
  });

  it('busca pela descrição sem diferenciar maiúsculas', async () => {
    const user = await createUser();
    await api.post('/transactions').set(user.auth).send({ description: 'Mercado do bairro', amount: 10, type: 'EXPENSE', date: '2026-10-10' });
    await api.post('/transactions').set(user.auth).send({ description: 'Farmácia', amount: 20, type: 'EXPENSE', date: '2026-10-11' });

    const response = await api.get('/transactions?year=2026&search=MERCADO').set(user.auth);
    expect(response.body.data.map((t: { description: string }) => t.description)).toEqual(['Mercado do bairro']);
  });

  it('filtra Débito e Pix juntos', async () => {
    const user = await createUser();
    for (const paymentMethod of ['PIX', 'DEBIT_CARD', 'CREDIT_CARD']) {
      await api.post('/transactions').set(user.auth).send({ description: paymentMethod, amount: 10, type: 'EXPENSE', date: '2026-10-10', paymentMethod });
    }

    const response = await api.get('/transactions?year=2026&paymentMethod=DEBIT_CARD,PIX').set(user.auth);
    expect(response.body.total).toBe(2);
  });

  it('pagina os resultados', async () => {
    const user = await createUser();
    for (let day = 1; day <= 12; day++) {
      await api.post('/transactions').set(user.auth).send({ description: `Dia ${day}`, amount: 1, type: 'EXPENSE', date: `2026-10-${String(day).padStart(2, '0')}` });
    }

    const page2 = await api.get('/transactions?year=2026&page=2&limit=10').set(user.auth);
    expect(page2.body).toMatchObject({ total: 12, totalPages: 2, page: 2 });
    expect(page2.body.data).toHaveLength(2);
  });

  it('recusa dados inválidos com 400, nunca 500', async () => {
    const user = await createUser();
    const invalid = await api.post('/transactions').set(user.auth).send({ description: 'X', amount: 'abc', type: 'EXPENSE', date: 'ontem' });
    const invalidQuery = await api.get('/transactions?year=abc').set(user.auth);

    expect(invalid.status).toBe(400);
    expect(invalidQuery.status).toBe(400);
  });
});

describe('isolamento entre usuários', () => {
  it('um usuário não vê nem altera lançamentos de outro', async () => {
    const ana = await createUser();
    const bia = await createUser();
    const created = await api.post('/transactions').set(ana.auth).send({ description: 'Da Ana', amount: 10, type: 'EXPENSE', date: '2026-10-10' });

    const biaList = await api.get('/transactions?year=2026').set(bia.auth);
    const biaEdit = await api.put(`/transactions/${created.body.id}`).set(bia.auth).send({ amount: 999 });
    const biaDelete = await api.delete(`/transactions/${created.body.id}`).set(bia.auth);

    expect(biaList.body.total).toBe(0);
    expect(biaEdit.status).toBe(404);
    expect(biaDelete.status).toBe(404);
  });

  it('não permite usar a categoria de outro usuário', async () => {
    const ana = await createUser();
    const bia = await createUser();
    const anaCategory = await findCategoryId(ana, 'Lazer');

    const response = await api.post('/transactions').set(bia.auth).send({ description: 'X', amount: 10, type: 'EXPENSE', date: '2026-10-10', categoryId: anaCategory });
    expect(response.status).toBe(400);
  });
});
