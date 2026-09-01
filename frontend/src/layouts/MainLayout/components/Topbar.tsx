import React from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
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
  '/goals': {
    title: 'Metas',
    description: 'Guarde dinheiro para seus objetivos e acompanhe o progresso.',
  },
};

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const theme = useTheme();

  const currentHeader = pageHeaders[location.pathname] || {
    title: 'FinanceHub',
    description: 'Plataforma de gestão financeira.',
  };

  // Categorias, Assinaturas e Metas não têm recorte temporal, então o
  // seletor de período não se aplica a essas telas.
  const showPeriodSelector = !['/categories', '/subscriptions', '/goals'].includes(location.pathname);

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
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={onMenuClick}
          aria-label="Abrir menu"
          sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'text.primary' }}
        >
          <MenuRoundedIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            {currentHeader.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {currentHeader.description}
          </Typography>
        </Box>
      </Box>
      {showPeriodSelector && (
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <PeriodSelector />
        </Box>
      )}
    </Box>
  );
};