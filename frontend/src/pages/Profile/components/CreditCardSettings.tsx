import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, useTheme } from '@mui/material';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';
import { useCreditCard, CREDIT_CARD_QUERY_KEY } from '../../../hooks/useCreditCard';

export const CreditCardSettings: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { notify } = useNotification();
  const { data: card, isLoading } = useCreditCard();

  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setClosingDay(card ? String(card.closingDay) : '');
    setDueDay(card ? String(card.dueDay) : '');
  }, [card]);

  const refreshCardData = () => {
    queryClient.invalidateQueries({ queryKey: CREDIT_CARD_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['transactions', 'credit-card-invoice'] });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/credit-card', { closingDay: Number(closingDay), dueDay: Number(dueDay) });
      refreshCardData();
      notify('Cartão de crédito salvo!', 'success');
    } catch (error: any) {
      notify(error.response?.data?.error || 'Erro ao salvar o cartão de crédito.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsSaving(true);
      await api.delete('/credit-card');
      refreshCardData();
      notify('Configuração do cartão removida.', 'success');
    } catch (error: any) {
      notify(error.response?.data?.error || 'Erro ao remover o cartão de crédito.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CreditCardRoundedIcon color="primary" fontSize="small" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Cartão de crédito
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Com essas datas, o Dashboard mostra a fatura real de cada mês. Compras feitas a partir do dia do
          fechamento entram na fatura seguinte.
        </Typography>

        <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Dia do fechamento"
              type="number"
              fullWidth
              required
              size="small"
              disabled={isLoading}
              slotProps={{ htmlInput: { min: 1, max: 31 } }}
              value={closingDay}
              onChange={(e) => setClosingDay(e.target.value)}
            />
            <TextField
              label="Dia do vencimento"
              type="number"
              fullWidth
              required
              size="small"
              disabled={isLoading}
              slotProps={{ htmlInput: { min: 1, max: 31 } }}
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {card && (
              <Button
                color="inherit"
                onClick={handleRemove}
                disabled={isSaving}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Remover
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={isSaving || isLoading}
              sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
