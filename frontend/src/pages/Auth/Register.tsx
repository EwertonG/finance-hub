import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { AuthSidePanel } from './components/AuthSidePanel';
import logoImg from '../../assets/logo.png';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_REQUIREMENTS_MESSAGE =
  'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
      signIn(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
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
          {/* Logo */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src={logoImg}
              alt="FinanceHUB Logo"
              sx={{
                height: 80,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
            Crie sua conta
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Comece a organizar suas finanças hoje mesmo.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', mb: 0.5, display: 'block' }}>
                Nome Completo
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Insira seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', mb: 0.5, display: 'block' }}>
                E-mail
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="Insira seu e-mail"
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

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', mb: 0.5, display: 'block' }}>
                Senha
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showPassword ? 'text' : 'password'}
                placeholder="Crie uma senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                helperText="Mín. 8 caracteres, com maiúscula, minúscula, número e símbolo"
                slotProps={{
                  input: {
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
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.2,
                bgcolor: '#047857',
                '&:hover': { bgcolor: '#064E3B' },
                fontSize: '0.95rem',
              }}
            >
              {loading ? 'Cadastrando...' : 'Criar Conta'}
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
              Já tenho uma conta
            </Button>
          </Box>
        </Box>

        <AuthSidePanel />
      </Card>
    </Box>
  );
};