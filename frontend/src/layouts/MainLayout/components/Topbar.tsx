import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { PeriodSelector } from './PeriodSelector';

const pageHeaders: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Dashboard',
    description: 'Visão geral das suas finanças e saldos em tempo real.',
  },
  '/transactions': {
    title: 'Lançamentos',
    description: 'Gerencie suas receitas, despesas e transferências.',
  },
  '/categories': {
    title: 'Categorias',
    description: 'Organize e personalize a classificação dos seus gastos.',
  },
  '/debtors': {
    title: 'Caderno de Devedores',
    description: 'Acompanhe divisões de contas e pendências com amigos.',
  },
  '/subscriptions': {
    title: 'Assinaturas',
    description: 'Gerencie cobranças recorrentes e parcelamentos.',
  },
};

export const Topbar: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();

  const currentHeader = pageHeaders[location.pathname] || {
    title: 'FinanceHub',
    description: 'Plataforma de gestão financeira.',
  };

  // Categorias e Assinaturas não têm recorte temporal, então o seletor de
  // período não se aplica a essas telas.
  const showPeriodSelector = !['/categories', '/subscriptions'].includes(location.pathname);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 5 },
        py: 2,
        bgcolor: 'background.default',
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          {currentHeader.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {currentHeader.description}
        </Typography>
      </Box>
      {showPeriodSelector && (
        <Box>
          <PeriodSelector />
        </Box>
      )}
    </Box>
  );
};