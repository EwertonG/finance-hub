import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { usePeriod } from '../../../contexts/PeriodContext';
import { MONTH_LABELS } from '../utils';
import type {
  Summary,
  DebtorSummary,
  Transaction,
  MonthSummary,
  GoalSummary,
  SubscriptionSummary,
  CategoryBreakdownItem,
} from '../types';

const EMPTY_SUMMARY: Summary = { income: 0, expense: 0, total: 0 };
const EMPTY_DEBTOR_SUMMARY: DebtorSummary = {
  totalPending: 0,
  totalCharged: 0,
  totalPaid: 0,
  totalToReceive: 0,
  totalOverall: 0,
};

// Limite de fatias exibidas no gráfico de categorias antes de agrupar o
// restante em "Outros", evitando um eixo Y com dezenas de barras.
const MAX_CATEGORY_BARS = 7;

function buildCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const expenses = transactions.filter((tx) => tx.type === 'EXPENSE');
  const totalExpenses = expenses.reduce((sum, tx) => sum + Number(tx.amount), 0);

  const categoryMap: Record<string, number> = {};
  expenses.forEach((tx) => {
    const catName = tx.category?.name || 'Sem categoria';
    categoryMap[catName] = (categoryMap[catName] || 0) + Number(tx.amount);
  });

  const sorted = Object.entries(categoryMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  if (sorted.length <= MAX_CATEGORY_BARS) return sorted;

  const rest = sorted.slice(MAX_CATEGORY_BARS);
  return [
    ...sorted.slice(0, MAX_CATEGORY_BARS),
    {
      name: 'Outros',
      amount: rest.reduce((sum, item) => sum + item.amount, 0),
      percentage: rest.reduce((sum, item) => sum + item.percentage, 0),
    },
  ];
}

export function useDashboardData() {
  const { month, year, viewMode } = usePeriod();

  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [previousSummary, setPreviousSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [annualSummary, setAnnualSummary] = useState<MonthSummary[]>([]);
  const [debtorsSummary, setDebtorsSummary] = useState<DebtorSummary>(EMPTY_DEBTOR_SUMMARY);
  const [periodTransactions, setPeriodTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryTransactions, setCategoryTransactions] = useState<Transaction[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<SubscriptionSummary[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);

  // Gastos por categoria, metas e assinaturas não acompanham o período
  // selecionado (visão sempre geral), então são buscados uma única vez, fora
  // do fluxo de recarga por período.
  useEffect(() => {
    api
      .get('/transactions')
      .then((res) => setCategoryTransactions(res.data.data))
      .catch((error) => console.error('Erro ao buscar transações para o gráfico de categorias', error))
      .finally(() => setCategoryLoading(false));

    api
      .get('/goals')
      .then((res) => setGoals(res.data))
      .catch((error) => console.error('Erro ao buscar metas', error))
      .finally(() => setGoalsLoading(false));

    api
      .get('/recurrences', { params: { kind: 'SUBSCRIPTION' } })
      .then((res) => setSubscriptions(res.data))
      .catch((error) => console.error('Erro ao buscar assinaturas', error))
      .finally(() => setSubscriptionsLoading(false));
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // O gráfico de evolução é sempre anual, então busca o ano do período
      // atual independentemente do viewMode selecionado. Também busca o ano
      // anterior, necessário para a comparação "vs período anterior" (cobre
      // o caso de janeiro comparando com dezembro do ano anterior).
      const [annualRes, previousAnnualRes] = await Promise.all([
        api.get('/transactions/annual-summary', { params: { year } }),
        api.get('/transactions/annual-summary', { params: { year: year - 1 } }),
      ]);
      const months: MonthSummary[] = annualRes.data.months;
      const previousMonths: MonthSummary[] = previousAnnualRes.data.months;
      setAnnualSummary(months);

      // Em modo mensal filtra pelo mês corrente; em modo anual usa o ano
      // inteiro (o backend aceita "year" sozinho para esse caso).
      const periodParams = viewMode === 'monthly' ? { month, year } : { year };

      const [transactionsRes, debtorsSummaryRes] = await Promise.all([
        api.get('/transactions', { params: periodParams }),
        api.get('/debtors/summary', { params: periodParams }),
      ]);

      setPeriodTransactions(transactionsRes.data.data);
      setDebtorsSummary(debtorsSummaryRes.data);

      if (viewMode === 'monthly') {
        const summaryRes = await api.get('/transactions/summary', { params: { month, year } });
        const { totalIncome, totalExpense, balance } = summaryRes.data;
        setSummary({ income: totalIncome, expense: totalExpense, total: balance });
      } else {
        const yearTotals = months.reduce(
          (acc, m) => ({
            income: acc.income + m.totalIncome,
            expense: acc.expense + m.totalExpense,
          }),
          { income: 0, expense: 0 }
        );
        setSummary({
          income: yearTotals.income,
          expense: yearTotals.expense,
          total: yearTotals.income - yearTotals.expense,
        });
      }

      // Período anterior: mês anterior (ou dezembro do ano anterior, se
      // janeiro) no modo mensal; ano anterior inteiro no modo anual.
      if (viewMode === 'monthly') {
        const previousMonthData = month === 1 ? previousMonths[11] : months[month - 2];
        setPreviousSummary({
          income: previousMonthData.totalIncome,
          expense: previousMonthData.totalExpense,
          total: previousMonthData.balance,
        });
      } else {
        const previousYearTotals = previousMonths.reduce(
          (acc, m) => ({
            income: acc.income + m.totalIncome,
            expense: acc.expense + m.totalExpense,
          }),
          { income: 0, expense: 0 }
        );
        setPreviousSummary({
          income: previousYearTotals.income,
          expense: previousYearTotals.expense,
          total: previousYearTotals.income - previousYearTotals.expense,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard', error);
    } finally {
      setLoading(false);
    }
  }, [month, year, viewMode]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const categoryBreakdown = buildCategoryBreakdown(categoryTransactions);

  const evolutionData = annualSummary.map((m) => ({
    monthLabel: MONTH_LABELS[m.month - 1],
    Receita: m.totalIncome,
    Despesa: m.totalExpense,
  }));

  return {
    month,
    year,
    viewMode,
    loading,
    summary,
    previousSummary,
    debtorsSummary,
    periodTransactions,
    evolutionData,
    categoryLoading,
    categoryBreakdown,
    goalsLoading,
    goals,
    subscriptionsLoading,
    subscriptions,
  };
}
