import React from 'react';
import { Box, Typography } from '@mui/material';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import PieChartOutlineRoundedIcon from '@mui/icons-material/PieChartOutlineRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import painelImg from '../../../assets/ilustracao-painel.png';

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

      {/* Painel ilustrativo */}
      <Box
        sx={{
          my: 'auto', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          component="img"
          src={painelImg}
          alt="Ilustração do Painel de Gestão"
          sx={{
            width: '100%',
            maxWidth: 310,
            height: 'auto',
            objectFit: 'contain',
            borderRadius: 4,
            filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.3))',
          }}
        />
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