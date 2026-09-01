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
import { api } from '../../../services/api';

export interface NewTransactionData {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  date: string;
  installmentTotal?: number;
}

export interface EditableTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string | null;
  date: string;
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewTransactionData) => void;
  transaction?: EditableTransaction | null;
}

interface Category {
  id: string;
  name: string;
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Busca as categorias e só então decide o valor do campo: pré-preenche a
  // partir de "transaction" ao editar, ou reseta para criação. Fica tudo num
  // único efeito para não haver corrida entre o carregamento e o preenchimento.
  useEffect(() => {
    if (!open) return;

    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setDate(transaction.date.split('T')[0]);
    } else {
      setType('EXPENSE');
      setDescription('');
      setAmount('');
      setDate(today);
    }

    setIsInstallment(false);
    setInstallmentTotal('2');
    loadCategories();
  }, [open, transaction]);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await api.get('/categories');
      setCategories(response.data);
      setCategory(transaction?.categoryId || response.data[0]?.id || '');
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      const fallbackCategories = [{ id: 'fallback', name: 'Outros' }];
      setCategories(fallbackCategories);
      setCategory('fallback');
    } finally {
      setIsLoadingCategories(false);
    }
  };

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