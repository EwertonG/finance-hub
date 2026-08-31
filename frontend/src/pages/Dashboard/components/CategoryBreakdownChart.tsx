import React from 'react';
import { Box, Card, Skeleton, Typography, useTheme } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import PieChartOutlineRoundedIcon from '@mui/icons-material/PieChartOutlineRounded';
import { EmptyState } from '../../../components/EmptyState';
import { formatCurrency } from '../utils';
import type { CategoryBreakdownItem } from '../types';

interface CategoryBreakdownChartProps {
  loading: boolean;
  data: CategoryBreakdownItem[];
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ loading, data }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
        Gastos por Categoria
      </Typography>
      {loading ? (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 3 }}>
          <Skeleton variant="rounded" height={220} />
        </Card>
      ) : data.length === 0 ? (
        <EmptyState icon={<PieChartOutlineRoundedIcon />} message="Nenhuma despesa categorizada encontrada." />
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 3 }}>
          <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
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
    </Box>
  );
};
