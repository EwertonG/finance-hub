import React from 'react';
import { Box, Card, LinearProgress, Skeleton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import { EmptyState } from '../../../components/EmptyState';
import { formatCurrency } from '../utils';
import { getCategoryIconComponent } from '../../../constants/categoryIcons';
import type { BudgetProgressItem } from '../types';

interface CategoryBudgetSectionProps {
  loading: boolean;
  items: BudgetProgressItem[];
  periodLabel: string;
}

// Vermelho ao estourar o limite, amarelo perto dele (80%+) — mesma lógica de
// alerta usada em apps de orçamento, sem exigir que o usuário leia os números.
function progressColor(percentage: number): 'error' | 'warning' | undefined {
  if (percentage >= 100) return 'error';
  if (percentage >= 80) return 'warning';
  return undefined;
}

export const CategoryBudgetSection: React.FC<CategoryBudgetSectionProps> = ({ loading, items, periodLabel }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
        Orçamento por Categoria · {periodLabel}
      </Typography>
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={40} />
          </Box>
        ) : items.length === 0 ? (
          <EmptyState
            variant="plain"
            icon={<SavingsRoundedIcon />}
            message="Nenhuma categoria com limite definido. Defina um em Categorias."
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((item) => {
              const percentage = item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
              const color = progressColor(percentage);
              const barColor = color ? theme.palette[color].main : item.color;
              const Icon = getCategoryIconComponent(item.icon);

              return (
                <Box key={item.categoryId}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: item.color, display: 'flex', '& svg': { fontSize: 18 } }}>
                        <Icon />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: color ? `${color}.main` : 'text.secondary' }}>
                      {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, percentage)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(barColor, 0.15),
                      '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: barColor },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Card>
    </Box>
  );
};
