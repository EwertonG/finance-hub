import { describe, it, expect, beforeEach } from 'vitest';
import { api, resetDatabase, createUser, findCategoryId, type TestUser } from '../helpers/api.js';

beforeEach(resetDatabase);

async function setupFood(user: TestUser, budget: number | null = 500) {
  const food = await findCategoryId(user, 'Alimentação');
  await api.put(`/categories/${food}`).set(user.auth).send({ budget });
  return food;
}

async function spend(user: TestUser, categoryId: string, amount: number, extra: Record<string, unknown> = {}) {
  const response = await api.post('/transactions').set(user.auth).send({
    description: 'Compra', amount, type: 'EXPENSE', date: '2026-10-10', categoryId, ...extra,
  });
  expect(response.status).toBe(201);
  return response.body;
}

describe('alerta de orçamento ao lançar', () => {
  it('abaixo de 80% não avisa', async () => {
    const user = await createUser();
    const food = await setupFood(user);

    expect((await spend(user, food, 300)).budgetAlert).toBeNull();
  });

  it('avisa ao cruzar 80%', async () => {
    const user = await createUser();
    const food = await setupFood(user);
    await spend(user, food, 300);

    const created = await spend(user, food, 125);
    expect(created.budgetAlert).toEqual({
      categoryId: food,
      categoryName: 'Alimentação',
      level: 'warning',
      budget: 500,
      spent: 425,
      percentage: 85,
    });
  });

  it('avisa ao estourar, mesmo pulando direto de menos de 80% para mais de 100%', async () => {
    const user = await createUser();
    const food = await setupFood(user);
    await spend(user, food, 100);

    const created = await spend(user, food, 430);
    expect(created.budgetAlert).toMatchObject({ level: 'exceeded', spent: 530, percentage: 106 });
  });

  it('não repete o aviso depois que o limite já foi cruzado', async () => {
    const user = await createUser();
    const food = await setupFood(user);
    await spend(user, food, 450);

    expect((await spend(user, food, 20)).budgetAlert).toBeNull();
    expect((await spend(user, food, 40)).budgetAlert).toMatchObject({ level: 'exceeded' });
    expect((await spend(user, food, 10)).budgetAlert).toBeNull();
  });

  it('chegar exatamente a 100% conta como estouro', async () => {
    const user = await createUser();
    const food = await setupFood(user);
    await spend(user, food, 450);

    expect((await spend(user, food, 50)).budgetAlert).toMatchObject({ level: 'exceeded', percentage: 100 });
  });

  it('só considera o mês do lançamento', async () => {
    const user = await createUser();
    const food = await setupFood(user);
    await spend(user, food, 450, { date: '2026-09-30' });

    expect((await spend(user, food, 100)).budgetAlert).toBeNull();
  });

  it('ignora receitas e categorias sem orçamento', async () => {
    const user = await createUser();
    const food = await setupFood(user);
    const leisure = await findCategoryId(user, 'Lazer');

    expect((await spend(user, food, 600, { type: 'INCOME' })).budgetAlert).toBeNull();
    expect((await spend(user, leisure, 10000)).budgetAlert).toBeNull();
  });

  it('avisa quando uma edição faz o gasto cruzar o limite', async () => {
    const user = await createUser();
    const food = await setupFood(user);
    await spend(user, food, 300);
    const purchase = await spend(user, food, 50);

    const edited = await api.put(`/transactions/${purchase.id}`).set(user.auth).send({ amount: 250 });
    expect(edited.status).toBe(200);
    expect(edited.body.budgetAlert).toMatchObject({ level: 'exceeded', spent: 550 });

    const unchanged = await api.put(`/transactions/${purchase.id}`).set(user.auth).send({ description: 'Mercado' });
    expect(unchanged.body.budgetAlert).toBeNull();
  });

  it('avisa ao parcelar uma compra, pela primeira parcela', async () => {
    const user = await createUser();
    const food = await setupFood(user, 200);
    await spend(user, food, 100);

    const response = await api.post('/recurrences').set(user.auth).send({
      description: 'Compra grande', totalAmount: 300, type: 'EXPENSE', categoryId: food,
      startDate: '2026-10-15', kind: 'INSTALLMENT', installmentTotal: 3,
    });

    expect(response.status).toBe(201);
    expect(response.body.budgetAlert).toMatchObject({ level: 'exceeded', spent: 200 });
  });
});
