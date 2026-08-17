import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Divider,
  useTheme,
  Menu,
  MenuItem
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

import logoImg from '../../../assets/logo.png'; 

const DRAWER_WIDTH = 240;

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { user, signOut } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut();
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

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
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* TOPO: Logo e Saudação */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
        <Box 
          component="img" 
          src={logoImg} 
          alt="FinanceHub Logo" 
          sx={{ height: 48, objectFit: 'contain', mb: 2 }} 
        />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Bem-vindo(a) de volta,
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: -0.5 }}>
          {firstName}!
        </Typography>
      </Box>

      <Divider sx={{ mx: 3, mb: 2, opacity: 0.6 }} />

      {/* MEIO: Lista de Navegação */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
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
                  <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'text.secondary', minWidth: 40 }}>
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
      </Box>

      {/* RODAPÉ: Perfil do Usuário Card */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5, 
            borderRadius: 3,
            bgcolor: '#F8FAFC',
            border: '1px solid #F1F5F9',
            '&:hover': { bgcolor: '#F1F5F9' },
            transition: 'background-color 0.2s'
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              width: 40,
              height: 40,
              fontWeight: 'bold',
              mr: 1.5
            }}
          >
            {initial}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Usuário'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }}>
              {user?.email || 'usuario@email.com'}
            </Typography>
          </Box>
          
          <IconButton size="small" onClick={handleMenuOpen} sx={{ ml: 0.5, color: 'text.secondary' }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Menu Suspenso de Opções/Logout */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
          slotProps={{
            paper: {
              sx: { mb: 1.5, minWidth: 180, borderRadius: 2, boxShadow: '0px 10px 20px -5px rgba(0,0,0,0.1)' }
            }
          }}
        >
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5 }}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            Sair da conta
          </MenuItem>
        </Menu>
      </Box>
    </Drawer>
  );
};