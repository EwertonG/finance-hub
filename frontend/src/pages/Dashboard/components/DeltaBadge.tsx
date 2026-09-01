import React from 'react';
import { Box, Typography } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

interface DeltaBadgeProps {
  current: number;
  previous: number;
  goodWhenUp: boolean;
}

// Compara o valor atual com o do período anterior. "goodWhenUp" define se
// subir é uma boa notícia (Receita/Saldo) ou ruim (Despesa).
export const DeltaBadge: React.FC<DeltaBadgeProps> = ({ current, previous, goodWhenUp }) => {
  if (!previous) return null;

  const diffPct = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(diffPct) < 0.5) return null;

  const isUp = diffPct > 0;
  const isGood = isUp === goodWhenUp;
  const Icon = isUp ? ArrowUpwardRoundedIcon : ArrowDownwardRoundedIcon;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', color: isGood ? 'success.main' : 'error.main' }}>
        <Icon sx={{ fontSize: 14 }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {Math.abs(diffPct).toFixed(0)}%
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        vs período anterior
      </Typography>
    </Box>
  );
};
