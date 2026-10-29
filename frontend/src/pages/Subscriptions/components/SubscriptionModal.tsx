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
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { api } from '../../../services/api';
import { useCategories } from '../../../hooks/useCategories';
import { useNotification } from '../../../contexts/NotificationContext';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from '../../../constants/paymentMethods';

export interface Subscription {
  id: string;
  description: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  startDate: string;
  active: boolean;
  categoryId: string | null;
  paymentMethod: PaymentMethod | null;
  category: { name: string } | null;
}

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (subscription: Subscription, mode: 'created' | 'updated') => void;
  subscription?: Subscription | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ open, onClose, onSaved, subscription }) => {
  const today = new Date().toISOString().split('T')[0];
  const isEditing = Boolean(subscription);
  const { notify } = useNotification();

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [applyToCurrentMonth, setApplyToCurrentMonth] = useState(true);

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (subscription) {
      setType(subscription.type);
      setDescription(subscription.description);
      setAmount(String(subscription.amount));
      setCategory(subscription.categoryId ?? '');
      setStartDate(subscription.startDate.split('T')[0]);
      setPaymentMethod(subscription.paymentMethod ?? '');
    } else {
      setType('EXPENSE');
      setDescription('');
      setAmount('');
      setCategory('');
      setStartDate(today);
      setPaymentMethod('');
    }
    setApplyToCurrentMonth(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, subscription]);

  useEffect(() => {
    if (!open || isEditing || categories.length === 0) return;
    setCategory((prev) => (prev && categories.some((c) => c.id === prev) ? prev : categories[0]?.id ?? ''));
  }, [open, isEditing, categories]);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: 'INCOME' | 'EXPENSE' | null) => {
    if (newType !== null) setType(newType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !startDate) return;

    try {
      setIsSubmitting(true);
      const response = subscription
        ? await api.put(`/recurrences/${subscription.id}`, {
            description,
            amount: parseFloat(amount),
            categoryId: category || null,
            paymentMethod: paymentMethod || null,
            applyToCurrentMonth,
          })
        : await api.post('/recurrences', {
            description,
            amount: parseFloat(amount),
            type,
            categoryId: category || undefined,
            startDate,
            kind: 'SUBSCRIPTION',
            paymentMethod: paymentMethod || undefined,
          });
      onSaved(response.data, subscription ? 'updated' : 'created');
      onClose();
    } catch (error: any) {
      console.error(subscription ? 'Erro ao atualizar assinatura:' : 'Erro ao criar assinatura:', error);
      notify(
        error.response?.data?.error || (subscription ? 'Erro ao atualizar assinatura.' : 'Erro ao criar assinatura.'),
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{isEditing ? 'Editar Assinatura' : 'Nova Assinatura'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {!isEditing && (
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
          )}

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
            {isEditing && <MenuItem value="">Sem categoria</MenuItem>}
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Forma de pagamento (opcional)"
            fullWidth
            size="small"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')}
          >
            <MenuItem value="">Não informado</MenuItem>
            {PAYMENT_METHODS.map((method) => (
              <MenuItem key={method} value={method}>
                {PAYMENT_METHOD_LABELS[method]}
              </MenuItem>
            ))}
          </TextField>

          {isEditing ? (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={applyToCurrentMonth}
                    onChange={(e) => setApplyToCurrentMonth(e.target.checked)}
                  />
                }
                label="Aplicar também à cobrança deste mês"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 4 }}>
                As cobranças dos meses anteriores não mudam. Desmarque se a deste mês já foi paga com os dados antigos.
              </Typography>
            </Box>
          ) : (
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
          )}
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
            {isSubmitting ? (isEditing ? 'Salvando...' : 'Criando...') : isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
