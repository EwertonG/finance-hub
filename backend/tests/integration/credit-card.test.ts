import { describe, it, expect, beforeEach } from 'vitest';
import { api, resetDatabase, createUser, type TestUser } from '../helpers/api.js';

beforeEach(resetDatabase);

async function addPurchase(user: TestUser, date: string, amount: number, extra: Record<string, unknown> = {}) {
  const response = await api.post('/transactions').set(user.auth).send({
    description: `Compra ${date}`,
    amount,
    type: 'EXPENSE',
    date,
    paymentMethod: 'CREDIT_CARD',
    ...extra,
  });
  expect(response.status).toBe(201);
}

async function invoice(user: TestUser, month: number, year: number) {
  const response = await api.get(`/credit-card/invoice?month=${month}&year=${year}`).set(user.auth);
  expect(response.status).toBe(200);
  return response.body;
}

describe('configuração do cartão', () => {
  it('começa sem cartão configurado', async () => {
    const user = await createUser();

    const card = await api.get('/credit-card').set(user.auth);
    expect(card.body).toBeNull();
    expect(await invoice(user, 11, 2025)).toEqual({ configured: false });
  });

  it('cadastra e depois edita os dias', async () => {
    const user = await createUser();

    const created = await api.put('/credit-card').set(user.auth).send({ closingDay: 5, dueDay: 12 });
    expect(created.status).toBe(200);
    expect(created.body).toMatchObject({ closingDay: 5, dueDay: 12 });

    await api.put('/credit-card').set(user.auth).send({ closingDay: 28, dueDay: 5 });
    const card = await api.get('/credit-card').set(user.auth);
    expect(card.body).toMatchObject({ closingDay: 28, dueDay: 5 });
  });

  it('recusa dias inválidos', async () => {
    const user = await createUser();

    const sameDay = await api.put('/credit-card').set(user.auth).send({ closingDay: 10, dueDay: 10 });
    const outOfRange = await api.put('/credit-card').set(user.auth).send({ closingDay: 32, dueDay: 5 });

    expect(sameDay.status).toBe(400);
    expect(sameDay.body.error).toBe('O vencimento deve ser em um dia diferente do fechamento.');
    expect(outOfRange.status).toBe(400);
  });

  it('remove a configuração', async () => {
    const user = await createUser();
    await api.put('/credit-card').set(user.auth).send({ closingDay: 5, dueDay: 12 });

    const removed = await api.delete('/credit-card').set(user.auth);
    expect(removed.status).toBe(204);
    expect(await invoice(user, 11, 2025)).toEqual({ configured: false });
  });
});

describe('fatura', () => {
  it('compras a partir do dia do fechamento vão para a fatura seguinte', async () => {
    const user = await createUser();
    await api.put('/credit-card').set(user.auth).send({ closingDay: 5, dueDay: 12 });

    await addPurchase(user, '2025-10-04', 10);
    await addPurchase(user, '2025-10-05', 20);
    await addPurchase(user, '2025-11-04', 30);
    await addPurchase(user, '2025-11-05', 40);

    const november = await invoice(user, 11, 2025);
    expect(november).toMatchObject({
      configured: true,
      total: 50,
      closingDate: '2025-11-05T00:00:00.000Z',
      dueDate: '2025-11-12T00:00:00.000Z',
      periodStart: '2025-10-05T00:00:00.000Z',
      periodEnd: '2025-11-04T00:00:00.000Z',
    });
    expect(november.transactions.map((t: { date: string }) => t.date.slice(0, 10))).toEqual(['2025-10-05', '2025-11-04']);

    expect((await invoice(user, 10, 2025)).total).toBe(10);
    expect((await invoice(user, 12, 2025)).total).toBe(40);
  });

  it('conta só despesas no crédito', async () => {
    const user = await createUser();
    await api.put('/credit-card').set(user.auth).send({ closingDay: 5, dueDay: 12 });

    await addPurchase(user, '2025-10-10', 100);
    await addPurchase(user, '2025-10-11', 200, { paymentMethod: 'DEBIT_CARD' });
    await addPurchase(user, '2025-10-12', 300, { paymentMethod: 'PIX' });
    await addPurchase(user, '2025-10-13', 400, { type: 'INCOME' });

    expect((await invoice(user, 11, 2025)).total).toBe(100);
  });

  it('cada parcela cai na fatura do seu mês', async () => {
    const user = await createUser();
    await api.put('/credit-card').set(user.auth).send({ closingDay: 5, dueDay: 12 });
    await api.post('/recurrences').set(user.auth).send({
      description: 'Geladeira', totalAmount: 300, type: 'EXPENSE', startDate: '2025-10-20',
      kind: 'INSTALLMENT', installmentTotal: 3, paymentMethod: 'CREDIT_CARD',
    });

    const totals = [];
    for (const month of [11, 12]) {
      totals.push((await invoice(user, month, 2025)).total);
    }
    totals.push((await invoice(user, 1, 2026)).total);
    expect(totals).toEqual([100, 100, 100]);

    const november = await invoice(user, 11, 2025);
    expect(november.transactions[0]).toMatchObject({ installmentNumber: 1, recurrence: { installmentTotal: 3 } });
  });

  it('cada usuário vê só a própria fatura', async () => {
    const ana = await createUser();
    const bia = await createUser();
    await api.put('/credit-card').set(ana.auth).send({ closingDay: 5, dueDay: 12 });
    await api.put('/credit-card').set(bia.auth).send({ closingDay: 5, dueDay: 12 });
    await addPurchase(ana, '2025-10-10', 70);

    expect((await invoice(ana, 11, 2025)).total).toBe(70);
    expect((await invoice(bia, 11, 2025)).total).toBe(0);
  });

  it('exige mês e ano válidos', async () => {
    const user = await createUser();
    const response = await api.get('/credit-card/invoice?month=13&year=2025').set(user.auth);
    expect(response.status).toBe(400);
  });
});
