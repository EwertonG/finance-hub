import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, useTheme, Switch, FormControlLabel, Divider } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import { useNotification } from '../../contexts/NotificationContext';

const formatDate = (dateString: string) => {
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

export const Profile: React.FC = () => {
  const theme = useTheme();
  const { user, updateUser } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const { notify } = useNotification();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      setIsSavingProfile(true);
      const response = await api.put('/auth/me', { name: name.trim(), email: email.trim() });
      updateUser(response.data.user);
      notify('Dados da conta atualizados com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      notify(error.response?.data?.error || 'Erro ao atualizar dados da conta.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      notify('A nova senha e a confirmação não coincidem.', 'error');
      return;
    }

    try {
      setIsSavingPassword(true);
      await api.put('/auth/me/password', { currentPassword, newPassword });
      notify('Senha alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erro ao trocar senha:', error);
      notify(error.response?.data?.error || 'Erro ao trocar senha.', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 560 }}>
      {/* Dados da conta */}
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonRoundedIcon color="primary" fontSize="small" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Dados da conta
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSaveProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome"
              fullWidth
              required
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {user?.createdAt && (
              <Typography variant="caption" color="text.secondary">
                Membro desde {formatDate(user.createdAt)}
              </Typography>
            )}
            <Box sx={{ textAlign: 'right' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSavingProfile}
                sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
              >
                {isSavingProfile ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LockRoundedIcon color="primary" fontSize="small" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Segurança
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSavePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Senha atual"
              type="password"
              fullWidth
              required
              size="small"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="Nova senha"
              type="password"
              fullWidth
              required
              size="small"
              slotProps={{ htmlInput: { minLength: 6 } }}
              helperText="Mínimo de 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirmar nova senha"
              type="password"
              fullWidth
              required
              size="small"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Box sx={{ textAlign: 'right' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSavingPassword}
                sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
              >
                {isSavingPassword ? 'Salvando...' : 'Trocar senha'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Preferências */}
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <DarkModeRoundedIcon color="primary" fontSize="small" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Preferências
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Modo escuro
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fica salvo neste navegador
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>
    </Box>
  );
};
