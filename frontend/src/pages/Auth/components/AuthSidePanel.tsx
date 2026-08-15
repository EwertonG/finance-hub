import React from 'react';
import { Box, Typography } from '@mui/material';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import PieChartOutlineRoundedIcon from '@mui/icons-material/PieChartOutlineRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';

export const AuthSidePanel: React.FC = () => {
  return (
    <Box
      sx={{
        flex: 1.1,
        backgroundColor: '#064E3B',
        color: '#FFFFFF',
        p: { xs: 4, md: 6 },
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        background: 'linear-gradient(145deg, #064E3B 0%, #022C22 100%)',
      }}
    >
      {/* Título de Destaque Superior */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Gestão de <span style={{ color: '#34D399' }}>Gastos</span>
        </Typography>
        <Typography variant="body2" sx={{ color: '#A7F3D0', mt: 1, fontSize: '0.95rem' }}>
          Controle simplificado e divisões inteligentes em um só lugar.
        </Typography>
      </Box>

      {/* Ilustração / Cards Visuais Centrais */}
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 340,
            p: 3,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <AccountBalanceWalletRoundedIcon sx={{ color: '#34D399', fontSize: 28 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Visão Geral
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#A7F3D0' }}>Saldo Líquido</Typography>
            <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 700 }}>Positivo</Typography>
          </Box>
          <Box sx={{ height: 6, width: '100%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: '70%', bgcolor: '#34D399', borderRadius: 3 }} />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChartOutlineRoundedIcon sx={{ color: '#6EE7B7', fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: '#F1F5F9' }}>Categorias</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QueryStatsRoundedIcon sx={{ color: '#6EE7B7', fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: '#F1F5F9' }}>Divisões</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Texto de Rodapé Informativo */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
          Gestão estratégica baseada em dados
        </Typography>
        <Typography variant="body2" sx={{ color: '#D1FAE5', lineHeight: 1.6, fontSize: '0.875rem' }}>
          Registre seus gastos por categorias, divida despesas com amigos automaticamente e acompanhe seus saldos em tempo real.
        </Typography>
      </Box>
    </Box>
  );
};