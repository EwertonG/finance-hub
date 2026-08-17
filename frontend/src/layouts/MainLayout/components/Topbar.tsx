import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../../../contexts/AuthContext';

export const Topbar: React.FC = () => {
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

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '80px' }}>
        
        {/* Lado Esquerdo: Ícone de Menu e Saudação */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Botão de menu hambúrguer, visível apenas em telas pequenas */}
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Olá, {user?.name ? user.name.split(' ')[0] : 'Usuário'} 👋
          </Typography>
        </Box>

        {/* Lado Direito: Avatar e Menu de Perfil */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText',
                width: 42,
                height: 42,
                fontWeight: 'bold'
              }}
            >
              {initial}
            </Avatar>
          </IconButton>

          {/* Menu Dropdown que abre ao clicar no Avatar */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 180,
                  borderRadius: 2,
                  boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
                }
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
      </Toolbar>
    </AppBar>
  );
};