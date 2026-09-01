import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { useCategories } from '../../../hooks/useCategories';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from '../../../constants/paymentMethods';

export interface NewTransactionData {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  date: string;
  installmentTotal?: number;
  paymentMethod?: PaymentMethod;
}

export interface EditableTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string | null;
  date: string;
  paymentMethod?: PaymentMethod | null;
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewTransactionData) => void;
  transaction?: EditableTransaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ open, onClose, onSubmit, transaction }) => {
  const today = new Date().toISOString().split('T')[0];
  const isEditing = Boolean(transaction);

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(today);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentTotal, setInstallmentTotal] = useState('2');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  // Pré-preenche a partir de "transaction" ao editar, ou reseta para criação.
  useEffect(() => {
    if (!open) return;

    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setDate(transaction.date.split('T')[0]);
      setPaymentMethod(transaction.paymentMethod || '');
    } else {
      setType('EXPENSE');
      setDescription('');
      setAmount('');
      setDate(today);
      setPaymentMethod('');
    }

    setIsInstallment(false);
    setInstallmentTotal('2');
  }, [open, transaction]);

  // Categorias vêm do cache compartilhado (já prontas na maioria das
  // aberturas), então a categoria default é escolhida assim que a lista
  // chega, em vez de esperar um fetch próprio do modal.
  useEffect(() => {
    if (!open || categories.length === 0) return;
    setCategory(transaction?.categoryId || categories[0]?.id || '');
  }, [open, transaction, categories]);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: 'INCOME' | 'EXPENSE' | null) => {
    if (newType !== null) {
      setType(newType);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;

    const shouldSplitInInstallments = !isEditing && isInstallment && Number(installmentTotal) >= 2;

    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      categoryId: category,
      date,
      ...(shouldSplitInInstallments ? { installmentTotal: Number(installmentTotal) } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={handleTypeChange}
            fullWidth
            size="small"
          >
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
            placeholder="Ex: Almoço de domingo"
            fullWidth
            required
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            label={isInstallment ? 'Valor total (R$)' : 'Valor (R$)'}
            type="number"
            placeholder="0,00"
            fullWidth
            required
            size="small"
            slotProps={{ htmlInput: { step: '0.01', min: '0.01' } }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {!isEditing && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isInstallment}
                    onChange={(e) => setIsInstallment(e.target.checked)}
                    size="small"
                  />
                }
                label="Parcelar"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
              {isInstallment && (
                <TextField
                  label="Número de parcelas"
                  type="number"
                  fullWidth
                  required
                  size="small"
                  slotProps={{ htmlInput: { step: '1', min: '2' } }}
                  value={installmentTotal}
                  onChange={(e) => setInstallmentTotal(e.target.value)}
                  helperText={
                    amount && Number(installmentTotal) >= 2
                      ? `${installmentTotal}x de R$ ${(parseFloat(amount) / Number(installmentTotal)).toFixed(2)}`
                      : ' '
                  }
                />
              )}
            </Box>
          )}

          <TextField
            select
            label="Categoria"
            fullWidth
            required
            size="small"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoadingCategories}
            slotProps={{
              input: {
                startAdornment: isLoadingCategories ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null,
              }
            }}
          >
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

          <TextField
            label="Data"
            type="date"
            fullWidth
            required
            size="small"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoadingCategories}
            sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};