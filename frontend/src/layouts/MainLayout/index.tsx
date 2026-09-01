import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';

export const MainLayout: React.FC = () => {
  // Abaixo do breakpoint "md" a Sidebar vira um Drawer sobreposto em vez de
  // permanente; esse estado controla se ele está aberto nesse modo.
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleDrawerClose = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerClose} />

      {/* Área Principal (Lado Direito) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar onMenuClick={handleDrawerToggle} />

        {/* Conteúdo Dinâmico das Páginas Internas */}
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            flexGrow: 1,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
