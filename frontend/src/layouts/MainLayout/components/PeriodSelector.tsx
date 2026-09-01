import React from 'react';
import { Box, IconButton, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { usePeriod } from '../../../contexts/PeriodContext';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const PeriodSelector: React.FC = () => {
  const theme = useTheme();
  const { month, year, viewMode, setViewMode, goToPreviousPeriod, goToNextPeriod } = usePeriod();

  const label = viewMode === 'monthly' ? `${MONTH_NAMES[month - 1]} ${year}` : `${year}`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        size="small"
        onChange={(_, value) => value && setViewMode(value)}
        sx={{
          '& .MuiToggleButton-root': {
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
          },
        }}
      >
        <ToggleButton value="monthly">Mensal</ToggleButton>
        <ToggleButton value="annual">Anual</ToggleButton>
      </ToggleButtonGroup>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <IconButton size="small" onClick={goToPreviousPeriod} aria-label="Período anterior">
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: { xs: 90, sm: 110 }, textAlign: 'center' }}>
          {label}
        </Typography>
        <IconButton size="small" onClick={goToNextPeriod} aria-label="Próximo período">
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};