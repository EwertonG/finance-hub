import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useTheme
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import { useLocation, useNavigate } from 'react-router-dom';

import logoImg from '../../../assets/logo.png'; 

const DRAWER_WIDTH = 280;

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const menuItems = [
    { title: 'Dashboard', path: '/', icon: <DashboardRoundedIcon /> },
    { title: 'Lançamentos', path: '/transactions', icon: <ReceiptLongRoundedIcon /> },
    { title: 'Categorias', path: '/categories', icon: <CategoryRoundedIcon /> },
    { title: 'Devedores', path: '/debtors', icon: <GroupRoundedIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper', 
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {/* Área da Logo */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1, mb: 2 }}>
        <Box 
          component="img" 
          src={logoImg} 
          alt="FinanceHub Logo" 
          sx={{ height: 48, objectFit: 'contain' }} 
        />
      </Box>

      {/* Lista de Navegação */}
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.95rem',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};