import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { usePeriod } from '../../../contexts/PeriodContext';
import { useAuth } from '../../../contexts/AuthContext';
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

interface CategoryBreakdownRow {
  name: string;
  amount: number;
}

function buildCategoryBreakdown(rows: CategoryBreakdownRow[]): CategoryBreakdownItem[] {
  const totalExpenses = rows.reduce((sum, row) => sum + row.amount, 0);

  const sorted = rows
    .map((row) => ({
      name: row.name,
      amount: row.amount,
      percentage: totalExpenses > 0 ? (row.amount / totalExpenses) * 100 : 0,
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

interface AnnualSummaryResponse {
  months: MonthSummary[];
}

export function useDashboardData() {
  const { month, year, viewMode } = usePeriod();
  const { user } = useAuth();

  // Em modo mensal filtra pelo mês corrente; em modo anual usa o ano inteiro
  // (o backend aceita "year" sozinho para esse caso). Mesmo formato de
  // params usado pelas páginas de Transações/Devedores, então o cache é
  // compartilhado quando o período coincide.
  const periodParams = viewMode === 'monthly' ? { month, year } : { year };

  const annualQuery = useQuery({
    queryKey: ['transactions', 'annual-summary', year],
    queryFn: async () => {
      const response = await api.get<AnnualSummaryResponse>('/transactions/annual-summary', { params: { year } });
      return response.data.months;
    },
  });

  const previousAnnualQuery = useQuery({
    queryKey: ['transactions', 'annual-summary', year - 1],
    queryFn: async () => {
      const response = await api.get<AnnualSummaryResponse>('/transactions/annual-summary', { params: { year: year - 1 } });
      return response.data.months;
    },
  });

  const periodTransactionsQuery = useQuery({
    queryKey: ['transactions', 'list', periodParams],
    queryFn: async () => {
      const response = await api.get('/transactions', { params: periodParams });
      return response.data.data as Transaction[];
    },
  });

  const debtorsSummaryQuery = useQuery({
    queryKey: ['debtors', 'summary', periodParams],
    queryFn: async () => {
      const response = await api.get<DebtorSummary>('/debtors/summary', { params: periodParams });
      return response.data;
    },
  });

  const monthlySummaryQuery = useQuery({
    queryKey: ['transactions', 'summary', month, year],
    queryFn: async () => {
      const response = await api.get('/transactions/summary', { params: { month, year } });
      return response.data as { totalIncome: number; totalExpense: number; balance: number };
    },
    enabled: viewMode === 'monthly',
  });

  const categoryBreakdownQuery = useQuery({
    queryKey: ['transactions', 'category-breakdown', periodParams],
    queryFn: async () => {
      const response = await api.get<CategoryBreakdownRow[]>('/transactions/category-breakdown', { params: periodParams });
      return response.data;
    },
  });

  const goalsQuery = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await api.get<GoalSummary[]>('/goals');
      return response.data;
    },
  });

  const subscriptionsQuery = useQuery({
    queryKey: ['recurrences', 'SUBSCRIPTION'],
    queryFn: async () => {
      const response = await api.get<SubscriptionSummary[]>('/recurrences', { params: { kind: 'SUBSCRIPTION' } });
      return response.data;
    },
  });

  const months = annualQuery.data ?? [];
  const previousMonths = previousAnnualQuery.data ?? [];

  const loading =
    annualQuery.isLoading ||
    previousAnnualQuery.isLoading ||
    periodTransactionsQuery.isLoading ||
    debtorsSummaryQuery.isLoading ||
    (viewMode === 'monthly' && monthlySummaryQuery.isLoading);

  let summary = EMPTY_SUMMARY;
  let previousSummary = EMPTY_SUMMARY;

  if (!loading && months.length === 12 && previousMonths.length === 12) {
    if (viewMode === 'monthly' && monthlySummaryQuery.data) {
      const { totalIncome, totalExpense, balance } = monthlySummaryQuery.data;
      summary = { income: totalIncome, expense: totalExpense, total: balance };

      // Período anterior: mês anterior (ou dezembro do ano anterior, se
      // janeiro) no modo mensal.
      const previousMonthData = month === 1 ? previousMonths[11] : months[month - 2];
      previousSummary = {
        income: previousMonthData.totalIncome,
        expense: previousMonthData.totalExpense,
        total: previousMonthData.balance,
      };
    } else if (viewMode !== 'monthly') {
      const yearTotals = months.reduce(
        (acc, m) => ({ income: acc.income + m.totalIncome, expense: acc.expense + m.totalExpense }),
        { income: 0, expense: 0 }
      );
      summary = { income: yearTotals.income, expense: yearTotals.expense, total: yearTotals.income - yearTotals.expense };

      // Período anterior: ano anterior inteiro no modo anual.
      const previousYearTotals = previousMonths.reduce(
        (acc, m) => ({ income: acc.income + m.totalIncome, expense: acc.expense + m.totalExpense }),
        { income: 0, expense: 0 }
      );
      previousSummary = {
        income: previousYearTotals.income,
        expense: previousYearTotals.expense,
        total: previousYearTotals.income - previousYearTotals.expense,
      };
    }
  }

  const categoryBreakdown = buildCategoryBreakdown(categoryBreakdownQuery.data ?? []);

  // Não mostra meses anteriores à criação da conta (não existiam dados
  // possíveis nesse intervalo). Usa getters UTC para bater com a convenção
  // de datas já usada no resto do app (ver backend/src/lib/dateFilter.ts).
  const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
  const visibleMonths = months.filter((m) => {
    if (!createdAt) return true;
    const createdYear = createdAt.getUTCFullYear();
    if (year > createdYear) return true;
    if (year < createdYear) return false;
    return m.month >= createdAt.getUTCMonth() + 1;
  });

  const evolutionData = visibleMonths.map((m) => ({
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
    debtorsSummary: debtorsSummaryQuery.data ?? EMPTY_DEBTOR_SUMMARY,
    periodTransactions: periodTransactionsQuery.data ?? [],
    evolutionData,
    categoryLoading: categoryBreakdownQuery.isLoading,
    categoryBreakdown,
    goalsLoading: goalsQuery.isLoading,
    goals: goalsQuery.data ?? [],
    subscriptionsLoading: subscriptionsQuery.isLoading,
    subscriptions: subscriptionsQuery.data ?? [],
  };
}
