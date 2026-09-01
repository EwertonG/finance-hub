import React from 'react';
import { Box, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { StatCardSkeleton } from './StatCardSkeleton';
import { formatCurrency } from '../utils';
import type { DebtorSummary, SubscriptionSummary } from '../types';

interface CommitmentsSummaryProps {
  debtorsLoading: boolean;
  debtorsSummary: DebtorSummary;
  subscriptionsLoading: boolean;
  subscriptions: SubscriptionSummary[];
}

// Devedores e assinaturas viram um único grupo de 4 cards do mesmo formato
// compacto — evita o problema de um card curto ao lado de um card alto
// (era o caso quando "Assinaturas Ativas" dividia linha com a lista de Metas).
export const CommitmentsSummary: React.FC<CommitmentsSummaryProps> = ({
  debtorsLoading,
  debtorsSummary,
  subscriptionsLoading,
  subscriptions,
}) => {
  const theme = useTheme();

  const activeSubscriptions = subscriptions.filter((s) => s.active);
  const monthlySubscriptionTotal = activeSubscriptions
    .filter((s) => s.type === 'EXPENSE')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const loading = debtorsLoading || subscriptionsLoading;

  const cards = [
    {
      title: 'A Receber (Pendente)',
      value: formatCurrency(debtorsSummary.totalToReceive),
      icon: <HourglassEmptyRoundedIcon />,
      paletteKey: 'warning' as const,
    },
    {
      title: 'Total Recebido (Pago)',
      value: formatCurrency(debtorsSummary.totalPaid),
      icon: <CheckCircleOutlineRoundedIcon />,
      paletteKey: 'success' as const,
    },
    {
      title: 'Total Dividido',
      value: formatCurrency(debtorsSummary.totalOverall),
      icon: <PeopleAltRoundedIcon />,
      paletteKey: 'info' as const,
    },
    {
      title: 'Assinaturas Ativas',
      value: String(activeSubscriptions.length),
      caption: `${formatCurrency(monthlySubscriptionTotal)}/mês comprometido`,
      icon: <AutorenewRoundedIcon />,
      paletteKey: 'primary' as const,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
        Compromissos
      </Typography>
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <StatCardSkeleton />
              </Grid>
            ))
          : cards.map((card) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
                <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        display: 'flex',
                        flexShrink: 0,
                        bgcolor: `${card.paletteKey}.light`,
                        color: `${card.paletteKey}.dark`,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: `${card.paletteKey}.main` }}>
                        {card.value}
                      </Typography>
                      {card.caption && (
                        <Typography variant="caption" color="text.secondary">
                          {card.caption}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>
    </Box>
  );
};
