import { describe, it, expect, beforeEach } from 'vitest';
import { api, resetDatabase, createUser, findCategoryId } from '../helpers/api.js';

beforeEach(resetDatabase);

describe('divisão de contas', () => {
  it('divide igualmente e a minha parte vira despesa com os centavos que sobram', async () => {
    const user = await createUser();
    const response = await api.post('/debtors').set(user.auth).send({
      item: 'Pizza', totalAmount: 100, people: ['Bia', 'Caio'], mySplit: true, date: '2026-10-20',
    });

    expect(response.status).toBe(201);
    expect(Number(response.body.myExpense.amount)).toBe(33.34);
    expect(response.body.debtors.map((d: { amount: string }) => Number(d.amount))).toEqual([33.33, 33.33]);
  });

  it('o resumo soma o que falta receber', async () => {
    const user = await createUser();
    const created = await api.post('/debtors').set(user.auth).send({
      item: 'Viagem', totalAmount: 300, people: ['Bia', 'Caio', 'Duda'], mySplit: false, date: '2026-10-20',
    });
    await api.put(`/debtors/${created.body.debtors[0].id}`).set(user.auth).send({ status: 'PAID' });

    const summary = await api.get('/debtors/summary?month=10&year=2026').set(user.auth);
    expect(summary.body).toMatchObject({ totalPaid: 100, totalToReceive: 200, totalOverall: 300 });
  });
});

describe('metas', () => {
  it('não permite resgatar mais que o saldo da meta', async () => {
    const user = await createUser();
    const goal = await api.post('/goals').set(user.auth).send({ name: 'Viagem', targetAmount: 1000, targetDate: null });
    await api.post(`/goals/${goal.body.id}/contributions`).set(user.auth).send({ amount: 300, type: 'DEPOSIT' });

    const tooMuch = await api.post(`/goals/${goal.body.id}/contributions`).set(user.auth).send({ amount: 300.01, type: 'WITHDRAWAL' });
    const exact = await api.post(`/goals/${goal.body.id}/contributions`).set(user.auth).send({ amount: 300, type: 'WITHDRAWAL' });

    expect(tooMuch.status).toBe(400);
    expect(exact.status).toBe(201);
  });

  it('calcula o progresso a partir das movimentações', async () => {
    const user = await createUser();
    const goal = await api.post('/goals').set(user.auth).send({ name: 'Reserva', targetAmount: 1000, targetDate: null });
    await api.post(`/goals/${goal.body.id}/contributions`).set(user.auth).send({ amount: 600, type: 'DEPOSIT' });
    await api.post(`/goals/${goal.body.id}/contributions`).set(user.auth).send({ amount: 100, type: 'WITHDRAWAL' });

    const goals = await api.get('/goals').set(user.auth);
    expect(goals.body[0]).toMatchObject({ currentAmount: 500, progress: 50, completed: false });
  });
});

describe('categorias', () => {
  it('não permite duas categorias com o mesmo nome', async () => {
    const user = await createUser();
    const response = await api.post('/categories').set(user.auth).send({ name: '  lazer ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Já existe uma categoria com esse nome.');
  });

  it('uma categoria serve para receitas e despesas', async () => {
    const user = await createUser();
    const others = await findCategoryId(user, 'Outros');
    await api.post('/transactions').set(user.auth).send({ description: 'Venda', amount: 200, type: 'INCOME', date: '2026-10-10', categoryId: others });
    await api.post('/transactions').set(user.auth).send({ description: 'Compra', amount: 80, type: 'EXPENSE', date: '2026-10-11', categoryId: others });

    const breakdown = await api.get('/transactions/category-breakdown?month=10&year=2026').set(user.auth);
    expect(breakdown.body).toEqual([expect.objectContaining({ name: 'Outros', amount: 80 })]);
  });

  it('excluir a categoria mantém os lançamentos, sem categoria', async () => {
    const user = await createUser();
    const leisure = await findCategoryId(user, 'Lazer');
    await api.post('/transactions').set(user.auth).send({ description: 'Cinema', amount: 40, type: 'EXPENSE', date: '2026-10-10', categoryId: leisure });

    const deleted = await api.delete(`/categories/${leisure}`).set(user.auth);
    const list = await api.get('/transactions?year=2026').set(user.auth);

    expect(deleted.status).toBe(204);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].category).toBeNull();
  });
});
