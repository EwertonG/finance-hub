import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, LinearProgress, Skeleton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import { EmptyState } from '../../../components/EmptyState';
import type { GoalSummary } from '../types';

interface GoalsSectionProps {
  loading: boolean;
  goals: GoalSummary[];
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({ loading, goals }) => {
  const theme = useTheme();
  const goalsToShow = goals.slice(0, 3);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
        Metas
      </Typography>
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 3 }}>
        {loading ? (
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
    </Box>
  );
};
