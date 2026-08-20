import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, useTheme, Grid } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { api } from '../../services/api';

interface Transaction {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

interface Summary {
  income: number;
  expense: number;
  total: number;
}

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0, total: 0 });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await api.get('/transactions');
      const transactions: Transaction[] = response.data;

      const calculatedSummary = transactions.reduce(
        (acc, curr) => {
          if (curr.type === 'INCOME') {
            acc.income += curr.amount;
            acc.total += curr.amount;
          } else {
            acc.expense += curr.amount;
            acc.total -= curr.amount;
          }
          return acc;
        },
        { income: 0, expense: 0, total: 0 }
      );

      setSummary(calculatedSummary);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Visão Geral
      </Typography>

      {/* Grid de Cards de Resumo */}
      <Grid container spacing={3}>
        {/* Card de Receitas */}
        <Grid size={{ xs:12, md:4}} >
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
        <Grid size={{xs:12, md:4}} >
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
        <Grid size = {{xs:12, md:4}} >
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
    </Box>
  );
};