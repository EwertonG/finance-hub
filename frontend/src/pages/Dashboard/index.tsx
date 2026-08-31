import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, useTheme, Grid, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PieChartOutlineRoundedIcon from '@mui/icons-material/PieChartOutlineRounded';
import { api } from '../../services/api';
import { usePeriod } from '../../contexts/PeriodContext';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';

interface Summary {
  income: number;
  expense: number;
  total: number;
}

interface DebtorSummary {
  totalPending: number;
  totalCharged: number;
  totalPaid: number;
  totalToReceive: number;
  totalOverall: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: { name: string } | null;
  date: string;
}

interface MonthSummary {
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Limite de fatias exibidas no gráfico de categorias antes de agrupar o
// restante em "Outros", evitando um eixo Y com dezenas de barras.
const MAX_CATEGORY_BARS = 7;

const StatCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2, flexShrink: 0 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="60%" sx={{ fontSize: '0.75rem' }} />
          <Skeleton variant="text" width="80%" sx={{ fontSize: '1.25rem' }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { month, year, viewMode } = usePeriod();

  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0, total: 0 });
  const [annualSummary, setAnnualSummary] = useState<MonthSummary[]>([]);
  const [debtorsSummary, setDebtorsSummary] = useState<DebtorSummary>({
    totalPending: 0,
    totalCharged: 0,
    totalPaid: 0,
    totalToReceive: 0,
    totalOverall: 0,
  });
  const [periodTransactions, setPeriodTransactions] = useState<Transaction[]>([]);
  const [categoryTransactions, setCategoryTransactions] = useState<Transaction[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Gastos por categoria não acompanham o período selecionado (visão sempre
  // geral), então são buscados uma única vez, fora do fluxo de recarga por período.
  useEffect(() => {
    api
      .get('/transactions')
      .then((res) => setCategoryTransactions(res.data.data))
      .catch((error) => console.error('Erro ao buscar transações para o gráfico de categorias', error))
      .finally(() => setCategoryLoading(false));
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // O gráfico de evolução é sempre anual, então busca o ano do período
      // atual independentemente do viewMode selecionado.
      const annualRes = await api.get('/transactions/annual-summary', { params: { year } });
      const months: MonthSummary[] = annualRes.data.months;
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
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard', error);
    } finally {
      setLoading(false);
    }
  }, [month, year, viewMode]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const datePart = dateString.split('T')[0];
    const [y, m, d] = datePart.split('-');
    return `${d}/${m}/${y}`;
  };

  // Calcular distribuição de gastos por categoria no período selecionado
  const expenses = categoryTransactions.filter(tx => tx.type === 'EXPENSE');
  const totalExpenses = expenses.reduce((sum, tx) => sum + Number(tx.amount), 0);

  const categoryMap: { [name: string]: number } = {};
  expenses.forEach(tx => {
    const catName = tx.category?.name || 'Sem categoria';
    categoryMap[catName] = (categoryMap[catName] || 0) + Number(tx.amount);
  });

  const sortedCategories = Object.entries(categoryMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Mantém o gráfico legível agrupando o excedente em "Outros" em vez de
  // gerar uma barra por categoria indefinidamente.
  const categoryBreakdown =
    sortedCategories.length > MAX_CATEGORY_BARS
      ? [
          ...sortedCategories.slice(0, MAX_CATEGORY_BARS),
          {
            name: 'Outros',
            amount: sortedCategories.slice(MAX_CATEGORY_BARS).reduce((sum, item) => sum + item.amount, 0),
            percentage: sortedCategories.slice(MAX_CATEGORY_BARS).reduce((sum, item) => sum + item.percentage, 0),
          },
        ]
      : sortedCategories;

  const evolutionData = annualSummary.map((m) => ({
    monthLabel: MONTH_LABELS[m.month - 1],
    Receita: m.totalIncome,
    Despesa: m.totalExpense,
  }));

  const periodLabel = viewMode === 'monthly' ? `${MONTH_LABELS[month - 1]}/${year}` : `${year}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
          Visão Geral · {periodLabel}
        </Typography>
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <StatCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : summary.income === 0 && summary.expense === 0 ? (
          <EmptyState variant="dashed" message="Nenhum lançamento financeiro encontrado neste período." />
        ) : (
          <Grid container spacing={3}>
            {/* Card de Receitas */}
            <Grid size={{ xs: 12, md: 4 }} >
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark', display: 'flex' }}>
                    <TrendingUpRoundedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Receitas
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(summary.income)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card de Despesas */}
            <Grid size={{ xs: 12, md: 4 }} >
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.light', color: 'error.dark', display: 'flex' }}>
                    <TrendingDownRoundedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Despesas
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {formatCurrency(summary.expense)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card de Saldo */}
            <Grid size={{ xs: 12, md: 4 }} >
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark', display: 'flex' }}>
                    <AccountBalanceWalletRoundedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Saldo Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {formatCurrency(summary.total)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      <>
          {/* Evolução Anual */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Evolução em {year}
            </Typography>
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 3 }}>
              {loading ? (
                <Skeleton variant="rounded" height={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={evolutionData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }} barGap={4}>
                    <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="monthLabel"
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                      tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      tickFormatter={formatCurrencyCompact}
                      width={64}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ borderRadius: 8, borderColor: theme.palette.divider }}
                    />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Bar dataKey="Receita" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="Despesa" fill={theme.palette.error.main} radius={[4, 4, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Cobranças (Devedores)
            </Typography>
            <Grid container spacing={3}>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Grid size={{ xs: 12, md: 4 }} key={index}>
                    <StatCardSkeleton />
                  </Grid>
                ))
              ) : (
                <>
                  {/* Card: A Receber */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark', display: 'flex' }}>
                          <HourglassEmptyRoundedIcon />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            A Receber (Pendente)
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            {formatCurrency(debtorsSummary.totalToReceive)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Card: Total Pago */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark', display: 'flex' }}>
                          <CheckCircleOutlineRoundedIcon />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Total Recebido (Pago)
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {formatCurrency(debtorsSummary.totalPaid)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Card: Total Geral */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.light', color: 'info.dark', display: 'flex' }}>
                          <PeopleAltRoundedIcon />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Total Dividido
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {formatCurrency(debtorsSummary.totalOverall)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {/* Últimos Lançamentos */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Últimos Lançamentos
              </Typography>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Descrição</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Categoria</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Data</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Valor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          <TableSkeleton rows={5} columns={4} />
                        ) : periodTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <EmptyState
                                variant="plain"
                                icon={<ReceiptLongRoundedIcon />}
                                message="Nenhum lançamento registrado neste período"
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                        periodTransactions.slice(0, 5).map((tx) => {
                          const isIncome = tx.type === 'INCOME';
                          return (
                            <TableRow key={tx.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: isIncome ? 'success.light' : 'error.light',
                                      color: isIncome ? 'success.dark' : 'error.dark',
                                      opacity: 0.9,
                                    }}
                                  >
                                    {isIncome ? <ArrowUpwardRoundedIcon fontSize="small" /> : <ArrowDownwardRoundedIcon fontSize="small" />}
                                  </Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {tx.description}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={tx.category?.name || 'Sem categoria'}
                                  size="small"
                                  sx={{
                                    borderRadius: 1.5,
                                    bgcolor: 'action.hover',
                                    color: 'text.primary',
                                    fontWeight: 500,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(tx.date)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: isIncome ? 'success.main' : 'error.main',
                                  }}
                                >
                                  {isIncome ? `+ ${formatCurrency(tx.amount)}` : `- ${formatCurrency(tx.amount)}`}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
              </Card>
            </Grid>

            {/* Gastos por Categoria */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Gastos por Categoria
              </Typography>
              {categoryLoading ? (
                <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 3 }}>
                  <Skeleton variant="rounded" height={220} />
                </Card>
              ) : categoryBreakdown.length === 0 ? (
                <EmptyState icon={<PieChartOutlineRoundedIcon />} message="Nenhuma despesa categorizada encontrada." />
              ) : (
                <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 3 }}>
                  <ResponsiveContainer width="100%" height={Math.max(220, categoryBreakdown.length * 44)}>
                    <BarChart
                      data={categoryBreakdown}
                      layout="vertical"
                      margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke={theme.palette.divider} />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        width={110}
                        tick={{ fill: theme.palette.text.primary, fontSize: 13 }}
                      />
                      <Tooltip
                        formatter={(value, _name, item) => [
                          `${formatCurrency(Number(value))} (${item.payload.percentage.toFixed(0)}%)`,
                          'Gasto',
                        ]}
                        contentStyle={{ borderRadius: 8, borderColor: theme.palette.divider }}
                      />
                      <Bar dataKey="amount" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} maxBarSize={22}>
                        <LabelList
                          dataKey="amount"
                          position="right"
                          formatter={(value) => formatCurrency(Number(value))}
                          style={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </Grid>
          </Grid>
      </>
    </Box>
  );
};
