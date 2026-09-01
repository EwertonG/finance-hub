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
  useMediaQuery,
  Menu,
  MenuItem
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { DRAWER_WIDTH } from '../constants';

import logoImg from '../../../assets/logo.png'; 

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { user, signOut } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGoToProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut();
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const menuItems = [
    { title: 'Dashboard', path: '/', icon: <DashboardRoundedIcon /> },
    { title: 'Lançamentos', path: '/transactions', icon: <ReceiptLongRoundedIcon /> },
    { title: 'Categorias', path: '/categories', icon: <CategoryRoundedIcon /> },
    { title: 'Devedores', path: '/debtors', icon: <GroupRoundedIcon /> },
    { title: 'Assinaturas', path: '/subscriptions', icon: <AutorenewRoundedIcon /> },
    { title: 'Metas', path: '/goals', icon: <SavingsRoundedIcon /> },
  ];

  // No modo mobile (Drawer sobreposto) navegar deve fechar o menu também.
  const handleNavigate = (path: string) => {
    navigate(path);
    if (!isDesktop) onMobileClose();
  };

  const drawerContent = (
    <>
      {/* TOPO: Logo e Saudação */}
      <Box
        sx={{
          height: 89,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxSizing: 'border-box',
        }}
      >
        <Box
          component="img"
          src={logoImg}
          alt="FinanceHub Logo"
          sx={{ height: 38, objectFit: 'contain' }}
        />
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
                  onClick={() => handleNavigate(item.path)}
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
            bgcolor: 'action.hover',
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': { bgcolor: 'action.selected' },
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
          <MenuItem onClick={handleGoToProfile} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            Perfil
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5 }}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            Sair da conta
          </MenuItem>
        </Menu>
      </Box>
    </>
  );

  const paperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box' as const,
    bgcolor: 'background.paper',
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column' as const,
  };

  // Desktop: Drawer permanente, sempre ocupando espaço no layout.
  // Mobile: Drawer sobreposto (temporary), some por baixo do conteúdo.
  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': paperSx }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': paperSx }}
    >
      {drawerContent}
    </Drawer>
  );
};