import React, { useState } from 'react';
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
  Typography,
} from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

export interface NewTransactionData {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewTransactionData) => void;
}

const defaultCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Trabalho', 'Saúde', 'Outros'];

export const TransactionModal: React.FC<TransactionModalProps> = ({ open, onClose, onSubmit }) => {
  const today = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(defaultCategories[0]);
  const [date, setDate] = useState(today);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: 'INCOME' | 'EXPENSE' | null) => {
    if (newType !== null) {
      setType(newType);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;

    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    });

    setDescription('');
    setAmount('');
    setCategory(defaultCategories[0]);
    setDate(today);
    setType('EXPENSE');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Novo Lançamento</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* Seletor de Tipo: Receita ou Despesa */}
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
                borderRadius: 2,
                gap: 1,
                textTransform: 'none',
                fontWeight: 600,
                color: 'error.main',
                '&.Mui-selected': {
                  bgcolor: 'error.light',
                  color: 'error.dark',
                  '&:hover': { bgcolor: 'error.light' },
                },
              }}
            >
              <ArrowDownwardRoundedIcon fontSize="small" />
              Despesa
            </ToggleButton>
            <ToggleButton
              value="INCOME"
              sx={{
                borderRadius: 2,
                gap: 1,
                textTransform: 'none',
                fontWeight: 600,
                color: 'success.main',
                '&.Mui-selected': {
                  bgcolor: 'success.light',
                  color: 'success.dark',
                  '&:hover': { bgcolor: 'success.light' },
                },
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
            label="Valor (R$)"
            type="number"
            placeholder="0,00"
            fullWidth
            required
            size="small"
            slotProps={{ 
                htmlInput: {step: '0.01', min: '0.01'},
            }}
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
          >
            {defaultCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
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
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};