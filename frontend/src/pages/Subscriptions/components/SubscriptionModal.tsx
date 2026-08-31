import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { api } from '../../../services/api';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface Category {
  id: string;
  name: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ open, onClose, onCreated }) => {
  const today = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(today);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setType('EXPENSE');
    setDescription('');
    setAmount('');
    setStartDate(today);

    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await api.get('/categories');
        setCategories(response.data);
        setCategory(response.data[0]?.id ?? '');
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: 'INCOME' | 'EXPENSE' | null) => {
    if (newType !== null) setType(newType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !startDate) return;

    try {
      setIsSubmitting(true);
      await api.post('/recurrences', {
        description,
        amount: parseFloat(amount),
        type,
        categoryId: category || undefined,
        startDate,
        kind: 'SUBSCRIPTION',
      });
      onCreated();
      onClose();
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Nova Assinatura</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <ToggleButtonGroup value={type} exclusive onChange={handleTypeChange} fullWidth size="small">
            <ToggleButton
              value="EXPENSE"
              sx={{
                borderRadius: 2, gap: 1, textTransform: 'none', fontWeight: 600, color: 'error.main',
                '&.Mui-selected': { bgcolor: 'error.light', color: 'error.dark', '&:hover': { bgcolor: 'error.light' } },
              }}
            >
              <ArrowDownwardRoundedIcon fontSize="small" />
              Despesa
            </ToggleButton>
            <ToggleButton
              value="INCOME"
              sx={{
                borderRadius: 2, gap: 1, textTransform: 'none', fontWeight: 600, color: 'success.main',
                '&.Mui-selected': { bgcolor: 'success.light', color: 'success.dark', '&:hover': { bgcolor: 'success.light' } },
              }}
            >
              <ArrowUpwardRoundedIcon fontSize="small" />
              Receita
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Descrição"
            placeholder="Ex: Netflix"
            fullWidth
            required
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoFocus
          />

          <TextField
            label="Valor mensal (R$)"
            type="number"
            placeholder="0,00"
            fullWidth
            required
            size="small"
            slotProps={{ htmlInput: { step: '0.01', min: '0.01' } }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <TextField
            select
            label="Categoria"
            fullWidth
            size="small"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoadingCategories}
            slotProps={{
              input: {
                startAdornment: isLoadingCategories ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null,
              },
            }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Cobrada a partir de"
            type="date"
            fullWidth
            required
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="O lançamento do mês corrente (e de meses já passados desde essa data) é criado automaticamente"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            {isSubmitting ? 'Criando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
