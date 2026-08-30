import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DRAWER_WIDTH } from './constants';

export const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Menu Lateral Fixo */}
      <Sidebar />

      {/* Área Principal (Lado Direito) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        {/* Cabeçalho */}
        <Topbar />

        {/* Conteúdo Dinâmico das Páginas Internas */}
        <Box 
          sx={{ 
            p: { xs: 2, md: 4 }, 
            flexGrow: 1, 
            overflow: 'auto' 
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};