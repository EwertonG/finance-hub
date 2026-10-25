import React, { useState } from 'react';
import { Box, TextField, Button, Typography, InputAdornment, Alert } from '@mui/material';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AuthLayout } from './components/AuthLayout';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
      setSuccessMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao solicitar a redefinição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      subtitle="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {successMessage} Confira também a caixa de spam.
          </Alert>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            fullWidth
            sx={{ py: 1.2, bgcolor: '#047857', '&:hover': { bgcolor: '#064E3B' }, fontSize: '0.95rem' }}
          >
            Voltar para o login
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', mb: 0.5, display: 'block' }}>
              E-mail
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 1, py: 1.2, bgcolor: '#047857', '&:hover': { bgcolor: '#064E3B' }, fontSize: '0.95rem' }}
          >
            {loading ? 'Enviando...' : 'Enviar link'}
          </Button>

          <Button
            component={Link}
            to="/login"
            variant="outlined"
            fullWidth
            sx={{
              py: 1.2,
              borderColor: '#CBD5E1',
              color: '#334155',
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
              fontSize: '0.95rem',
            }}
          >
            Voltar para o login
          </Button>
        </Box>
      )}
    </AuthLayout>
  );
};
