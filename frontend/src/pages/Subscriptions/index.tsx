import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { TableSkeleton } from '../../components/TableSkeleton';
import { SubscriptionModal } from './components/SubscriptionModal';
import type { Subscription } from './components/SubscriptionModal';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) => {
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

const SUBSCRIPTIONS_QUERY_KEY = ['recurrences', 'SUBSCRIPTION'];

export const Subscriptions: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { notify } = useNotification();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: SUBSCRIPTIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get('/recurrences', { params: { kind: 'SUBSCRIPTION' } });
      return response.data as Subscription[];
    },
  });

  // Otimista: alterna o status na hora, sem esperar o servidor confirmar;
  // reverte e avisa se der erro.
  const handleToggleActive = async (subscription: Subscription) => {
    const nextActive = !subscription.active;
    queryClient.setQueryData<Subscription[]>(SUBSCRIPTIONS_QUERY_KEY, (prev = []) =>
      prev.map((s) => (s.id === subscription.id ? { ...s, active: nextActive } : s))
    );

    try {
      await api.put(`/recurrences/${subscription.id}`, { active: nextActive });
      notify(nextActive ? 'Assinatura reativada.' : 'Assinatura cancelada.', 'success');
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      queryClient.setQueryData<Subscription[]>(SUBSCRIPTIONS_QUERY_KEY, (prev = []) =>
        prev.map((s) => (s.id === subscription.id ? subscription : s))
      );
      notify('Erro ao atualizar assinatura. Tente novamente.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    const previousSubscriptions = queryClient.getQueryData<Subscription[]>(SUBSCRIPTIONS_QUERY_KEY);

    queryClient.setQueryData<Subscription[]>(SUBSCRIPTIONS_QUERY_KEY, (prev = []) => prev.filter((s) => s.id !== idToDelete));
    setDeleteId(null);

    try {
      await api.delete(`/recurrences/${idToDelete}`);
      notify('Assinatura excluída. Os lançamentos já gerados foram mantidos.', 'success');
    } catch (error) {
      console.error('Erro ao excluir assinatura:', error);
      queryClient.setQueryData(SUBSCRIPTIONS_QUERY_KEY, previousSubscriptions);
      notify('Erro ao excluir assinatura. Tente novamente.', 'error');
    }
  };

  const handleSubscriptionSaved = (subscription: Subscription) => {
    queryClient.setQueryData<Subscription[]>(SUBSCRIPTIONS_QUERY_KEY, (prev = []) => [...prev, subscription]);
    // Criar uma assinatura gera a transação do período corrente na hora.
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    notify('Assinatura criada com sucesso!', 'success');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ borderRadius: 2, px: 2.5, py: 1, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
        >
          Nova Assinatura
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Descrição</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Categoria</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Início</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Valor Mensal</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={4} columns={6} />
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState
                        variant="plain"
                        icon={<AutorenewRoundedIcon />}
                        message="Nenhuma assinatura cadastrada"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => {
                    const isIncome = subscription.type === 'INCOME';
                    return (
                      <TableRow key={subscription.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {subscription.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subscription.category?.name || 'Sem categoria'}
                            size="small"
                            sx={{ borderRadius: 1.5, bgcolor: 'action.hover', color: 'text.primary', fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(subscription.startDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: isIncome ? 'success.main' : 'error.main' }}
                          >
                            {formatCurrency(subscription.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subscription.active ? 'Ativa' : 'Cancelada'}
                            size="small"
                            color={subscription.active ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: 1.5 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title={subscription.active ? 'Cancelar assinatura' : 'Reativar assinatura'}>
                              <IconButton size="small" onClick={() => handleToggleActive(subscription)}>
                                {subscription.active ? (
                                  <PauseCircleOutlineRoundedIcon fontSize="small" />
                                ) : (
                                  <PlayCircleOutlineRoundedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton size="small" color="default" onClick={() => setDeleteId(subscription.id)}>
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <SubscriptionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSubscriptionSaved}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir assinatura"
        message="Tem certeza que deseja excluir esta assinatura? Os lançamentos já gerados são mantidos, só a geração automática futura para."
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};
