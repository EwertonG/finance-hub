import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { api } from '../../../services/api';

interface ContributionModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  goalId: string | null;
  goalName?: string;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({ open, onClose, onSaved, goalId, goalName }) => {
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType('DEPOSIT');
    setAmount('');
    setNote('');
  }, [open]);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: 'DEPOSIT' | 'WITHDRAWAL' | null) => {
    if (newType !== null) setType(newType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId || !amount) return;

    try {
      setIsSubmitting(true);
      await api.post(`/goals/${goalId}/contributions`, {
        amount: parseFloat(amount),
        type,
        note: note || undefined,
      });
      onSaved();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar contribuição:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{goalName ? `Movimentar "${goalName}"` : 'Movimentar meta'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <ToggleButtonGroup value={type} exclusive onChange={handleTypeChange} fullWidth size="small">
            <ToggleButton
              value="DEPOSIT"
              sx={{
                borderRadius: 2, gap: 1, textTransform: 'none', fontWeight: 600, color: 'success.main',
                '&.Mui-selected': { bgcolor: 'success.light', color: 'success.dark', '&:hover': { bgcolor: 'success.light' } },
              }}
            >
              <ArrowUpwardRoundedIcon fontSize="small" />
              Depositar
            </ToggleButton>
            <ToggleButton
              value="WITHDRAWAL"
              sx={{
                borderRadius: 2, gap: 1, textTransform: 'none', fontWeight: 600, color: 'error.main',
                '&.Mui-selected': { bgcolor: 'error.light', color: 'error.dark', '&:hover': { bgcolor: 'error.light' } },
              }}
            >
              <ArrowDownwardRoundedIcon fontSize="small" />
              Sacar
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Valor (R$)"
            type="number"
            placeholder="0,00"
            fullWidth
            required
            size="small"
            autoFocus
            slotProps={{ htmlInput: { step: '0.01', min: '0.01' } }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <TextField
            label="Nota (opcional)"
            placeholder="Ex: 13º salário"
            fullWidth
            size="small"
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
            {isSubmitting ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
