import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { AuthSidePanel } from './AuthSidePanel';
import logoImg from '../../../assets/logo-horizontal.svg';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#F1F5F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, md: 4 },
    }}
  >
    <Card
      sx={{
        width: '100%',
        maxWidth: 960,
        minHeight: 580,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        borderRadius: 6,
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          p: { xs: 3, sm: 6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={logoImg}
            alt="CentralFinanças Logo"
            sx={{ height: 80, width: 'auto', objectFit: 'contain' }}
          />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          {subtitle}
        </Typography>

        {children}
      </Box>

      <AuthSidePanel />
    </Card>
  </Box>
);
