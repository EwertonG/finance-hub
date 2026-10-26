import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api, resetDatabase, createUser, type TestUser } from '../helpers/api.js';

beforeEach(resetDatabase);
afterEach(() => {
  vi.useRealTimers();
});

function setToday(isoDate: string) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${isoDate}T12:00:00.000Z`));
}

async function listCharges(user: TestUser, recurrenceId: string) {
  const response = await api.get('/transactions?year=2025').set(user.auth);
  return response.body.data
    .filter((t: { recurrenceId: string }) => t.recurrenceId === recurrenceId)
    .map((t: { date: string }) => t.date.slice(0, 7))
    .sort();
}

describe('parcelamento', () => {
  it('cria todas as parcelas e coloca os centavos na última', async () => {
    const user = await createUser();
    const response = await api.post('/recurrences').set(user.auth).send({
      description: 'TV', totalAmount: 100, type: 'EXPENSE', startDate: '2026-01-31', kind: 'INSTALLMENT', installmentTotal: 3,
    });
    expect(response.status).toBe(201);

    const list = await api.get('/transactions?year=2026&search=TV').set(user.auth);
    const installments = list.body.data
      .map((t: { installmentNumber: number; amount: string; date: string }) => ({
        n: t.installmentNumber,
        amount: Number(t.amount),
        date: t.date.slice(0, 10),
      }))
      .sort((a: { n: number }, b: { n: number }) => a.n - b.n);

    expect(installments).toEqual([
      { n: 1, amount: 33.33, date: '2026-01-31' },
      { n: 2, amount: 33.33, date: '2026-02-28' },
      { n: 3, amount: 33.34, date: '2026-03-31' },
    ]);
  });

  it('parcelamento em andamento gera só as parcelas restantes', async () => {
    const user = await createUser();
    await api.post('/recurrences').set(user.auth).send({
      description: 'Sofá', totalAmount: 1000, type: 'EXPENSE', startDate: '2026-10-10', kind: 'INSTALLMENT', installmentTotal: 10, startInstallmentNumber: 8,
    });

    const list = await api.get('/transactions?search=Sofá').set(user.auth);
    expect(list.body.data.map((t: { installmentNumber: number }) => t.installmentNumber).sort((a: number, b: number) => a - b)).toEqual([8, 9, 10]);
  });
});

describe('assinatura', () => {
  async function createSubscription(user: TestUser, startDate: string) {
    const response = await api.post('/recurrences').set(user.auth).send({
      description: 'Streaming', amount: 40, type: 'EXPENSE', startDate, kind: 'SUBSCRIPTION',
    });
    expect(response.status).toBe(201);
    return response.body.id as string;
  }

  it('gera uma cobrança por mês até o mês atual', async () => {
    const user = await createUser();
    setToday('2025-10-20');
    const id = await createSubscription(user, '2025-07-15');

    expect(await listCharges(user, id)).toEqual(['2025-07', '2025-08', '2025-09', '2025-10']);
  });

  it('uma cobrança apagada não volta nem gera duplicata', async () => {
    const user = await createUser();
    setToday('2025-10-20');
    const id = await createSubscription(user, '2025-08-15');

    const all = await api.get('/transactions?year=2025').set(user.auth);
    const september = all.body.data.find((t: { date: string }) => t.date.startsWith('2025-09'));
    await api.delete(`/transactions/${september.id}`).set(user.auth);

    setToday('2025-10-25');
    expect(await listCharges(user, id)).toEqual(['2025-08', '2025-10']);
  });

  it('reativar não cobra os meses em que ficou pausada', async () => {
    const user = await createUser();
    setToday('2025-03-10');
    const id = await createSubscription(user, '2025-02-10');
    await api.put(`/recurrences/${id}`).set(user.auth).send({ active: false });

    setToday('2025-07-10');
    await api.put(`/recurrences/${id}`).set(user.auth).send({ active: true });

    expect(await listCharges(user, id)).toEqual(['2025-02', '2025-03', '2025-07']);
  });

  it('o mês seguinte aparece quando o mês vira', async () => {
    const user = await createUser();
    setToday('2025-10-20');
    const id = await createSubscription(user, '2025-10-05');
    expect(await listCharges(user, id)).toEqual(['2025-10']);

    setToday('2025-11-02');
    expect(await listCharges(user, id)).toEqual(['2025-10', '2025-11']);
  });
});
