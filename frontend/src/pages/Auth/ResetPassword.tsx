import React, { useState } from 'react';
import { Box, TextField, Button, Typography, InputAdornment, IconButton, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE } from '../../constants/password';
import { AuthLayout } from './components/AuthLayout';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      notify('Senha redefinida! Entre com a nova senha.', 'success');
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao redefinir a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const passwordAdornments = {
    startAdornment: (
      <InputAdornment position="start">
        <LockOutlinedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
      </InputAdornment>
    ),
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
          {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
        </IconButton>
      </InputAdornment>
    ),
  };

  if (!token) {
    return (
      <AuthLayout title="Link inválido" subtitle="Este link de redefinição está incompleto.">
        <Button
          component={Link}
          to="/forgot-password"
          variant="contained"
          fullWidth
          sx={{ py: 1.2, bgcolor: '#047857', '&:hover': { bgcolor: '#064E3B' }, fontSize: '0.95rem' }}
        >
          Solicitar um novo link
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crie uma nova senha" subtitle="Escolha uma senha forte que você ainda não tenha usado.">
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            error.includes('expirado') ? (
              <Button component={Link} to="/forgot-password" color="inherit" size="small">
                Novo link
              </Button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', mb: 0.5, display: 'block' }}>
            Nova senha
          </Typography>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            placeholder="Digite a nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo"
            slotProps={{ input: passwordAdornments }}
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', mb: 0.5, display: 'block' }}>
            Confirmar nova senha
          </Typography>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            slotProps={{ input: passwordAdornments }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 1, py: 1.2, bgcolor: '#047857', '&:hover': { bgcolor: '#064E3B' }, fontSize: '0.95rem' }}
        >
          {loading ? 'Salvando...' : 'Redefinir senha'}
        </Button>
      </Box>
    </AuthLayout>
  );
};
