import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, Grid, LinearProgress, Skeleton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import { EmptyState } from '../../../components/EmptyState';
import { StatCardSkeleton } from './StatCardSkeleton';
import { formatCurrency } from '../utils';
import type { GoalSummary, SubscriptionSummary } from '../types';

interface GoalsSubscriptionsWidgetProps {
  goalsLoading: boolean;
  goals: GoalSummary[];
  subscriptionsLoading: boolean;
  subscriptions: SubscriptionSummary[];
}

export const GoalsSubscriptionsWidget: React.FC<GoalsSubscriptionsWidgetProps> = ({
  goalsLoading,
  goals,
  subscriptionsLoading,
  subscriptions,
}) => {
  const theme = useTheme();

  const goalsToShow = goals.slice(0, 3);
  const activeSubscriptions = subscriptions.filter((s) => s.active);
  const monthlySubscriptionTotal = activeSubscriptions
    .filter((s) => s.type === 'EXPENSE')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
        Metas & Assinaturas
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 3, height: '100%' }}>
            {goalsLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
              </Box>
            ) : goalsToShow.length === 0 ? (
              <EmptyState variant="plain" icon={<SavingsRoundedIcon />} message="Nenhuma meta cadastrada ainda." />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {goalsToShow.map((goal) => (
                  <Box key={goal.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {goal.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: goal.color }}>
                        {goal.progress.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(goal.color, 0.15),
                        '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: goal.color },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Typography
                component={RouterLink}
                to="/goals"
                variant="caption"
                sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}
              >
                Ver todas as metas →
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          {subscriptionsLoading ? (
            <StatCardSkeleton />
          ) : (
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark', display: 'flex' }}>
                  <AutorenewRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Assinaturas Ativas
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {activeSubscriptions.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(monthlySubscriptionTotal)}/mês comprometido
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
