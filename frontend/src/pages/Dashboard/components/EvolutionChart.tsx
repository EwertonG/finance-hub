import React from 'react';
import { Box, Card, Skeleton, Typography, useTheme } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatCurrencyCompact } from '../utils';

interface EvolutionChartProps {
  loading: boolean;
  year: number;
  data: { monthLabel: string; Receita: number; Despesa: number }[];
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ loading, year, data }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
        Evolução em {year}
      </Typography>
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, p: 3 }}>
        {loading ? (
          <Skeleton variant="rounded" height={280} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }} barGap={4}>
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
  );
};
