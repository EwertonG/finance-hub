import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, useTheme, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { api } from '../../services/api';

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

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0, total: 0 });
  const [debtorsSummary, setDebtorsSummary] = useState<DebtorSummary>({
    totalPending: 0,
    totalCharged: 0,
    totalPaid: 0,
    totalToReceive: 0,
    totalOverall: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryRes, debtorsSummaryRes, transactionsRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/debtors/summary'),
        api.get('/transactions'),
      ]);

      const { totalIncome, totalExpense, balance } = summaryRes.data;
      setSummary({
        income: totalIncome,
        expense: totalExpense,
        total: balance,
      });

      setDebtorsSummary(debtorsSummaryRes.data);
      setRecentTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
          Visão Geral
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : summary.income === 0 && summary.expense === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', border: `1px dashed ${theme.palette.divider}`, borderRadius: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum lançamento financeiro encontrado ainda.
            </Typography>
          </Box>
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

      {!loading && (
        <>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Cobranças (Devedores)
            </Typography>
            <Grid container spacing={3}>
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
            </Grid>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Últimos Lançamentos
            </Typography>
            {recentTransactions.length === 0 ? (
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum lançamento registrado.
                </Typography>
              </Card>
            ) : (
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
                      {recentTransactions.slice(0, 5).map((tx) => {
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
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};