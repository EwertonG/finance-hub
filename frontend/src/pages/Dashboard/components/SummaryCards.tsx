import React from 'react';
import { Box, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { EmptyState } from '../../../components/EmptyState';
import { StatCardSkeleton } from './StatCardSkeleton';
import { DeltaBadge } from './DeltaBadge';
import { formatCurrency } from '../utils';
import type { Summary } from '../types';

interface SummaryCardsProps {
  loading: boolean;
  summary: Summary;
  previousSummary: Summary;
  periodLabel: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ loading, summary, previousSummary, periodLabel }) => {
  const theme = useTheme();

  return (
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
          <Grid size={{ xs: 12, md: 4 }}>
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
                  <DeltaBadge current={summary.income} previous={previousSummary.income} goodWhenUp />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
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
                  <DeltaBadge current={summary.expense} previous={previousSummary.expense} goodWhenUp={false} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
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
                  <DeltaBadge current={summary.total} previous={previousSummary.total} goodWhenUp />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
