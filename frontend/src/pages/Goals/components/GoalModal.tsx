import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { api } from '../../../services/api';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string | null;
  color: string;
}

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  goal?: Goal | null;
}

const GOAL_COLORS = ['#047857', '#2563EB', '#D97706', '#7C3AED', '#DB2777', '#0891B2'];

export const GoalModal: React.FC<GoalModalProps> = ({ open, onClose, onSaved, goal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(goal);

  useEffect(() => {
    if (!open) return;

    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
      setTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '');
      setColor(goal.color);
    } else {
      setName('');
      setTargetAmount('');
      setTargetDate('');
      setColor(GOAL_COLORS[0]);
    }
  }, [open, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    try {
      setIsSubmitting(true);
      const data = {
        name,
        targetAmount: parseFloat(targetAmount),
        targetDate: targetDate || null,
        color,
      };

      if (goal) {
        await api.put(`/goals/${goal.id}`, data);
      } else {
        await api.post('/goals', data);
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{isEditing ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Nome"
            placeholder="Ex: Viagem para a praia"
            fullWidth
            required
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <TextField
            label="Valor alvo (R$)"
            type="number"
            placeholder="0,00"
            fullWidth
            required
            size="small"
            slotProps={{ htmlInput: { step: '0.01', min: '0.01' } }}
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
          />

          <TextField
            label="Data alvo (opcional)"
            type="date"
            fullWidth
            size="small"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Cor
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {GOAL_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setColor(c)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: c,
                    cursor: 'pointer',
                    border: color === c ? '2px solid' : '2px solid transparent',
                    borderColor: color === c ? 'text.primary' : 'transparent',
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </Box>
          </Box>
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
            {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
