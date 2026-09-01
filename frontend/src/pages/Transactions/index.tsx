import React, { useState, useEffect } from 'react';
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
  Typography,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { TransactionModal } from './components/TransactionModal';
import type { NewTransactionData } from './components/TransactionModal';
import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { usePeriod } from '../../contexts/PeriodContext';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { TableSkeleton } from '../../components/TableSkeleton';
import { getCategoryIconComponent } from '../../constants/categoryIcons';
import { useCategories } from '../../hooks/useCategories';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: { name: string; color: string; icon: string } | null;
  categoryId: string | null;
  date: string;
  installmentNumber: number | null;
  recurrence: { kind: 'INSTALLMENT' | 'SUBSCRIPTION'; installmentTotal: number | null } | null;
}

const PAGE_SIZE = 10;

export const Transactions: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const { data: categories = [] } = useCategories();
  const [page, setPage] = useState(1);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { notify } = useNotification();
  const { month, year, viewMode } = usePeriod();

  const listParams = {
    ...(viewMode === 'monthly' ? { month, year } : { year }),
    ...(typeFilter !== 'ALL' ? { type: typeFilter } : {}),
    ...(categoryFilter !== 'ALL' ? { categoryId: categoryFilter } : {}),
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', 'list', listParams],
    queryFn: async () => {
      const response = await api.get('/transactions', { params: listParams });
      return response.data as { data: Transaction[]; totalPages: number };
    },
    placeholderData: (previous) => previous,
  });

  const transactions = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Muda de período (contexto global) reseta a página, que pode não existir
  // mais no novo recorte.
  useEffect(() => {
    setPage(1);
  }, [month, year, viewMode]);

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleOpenCreateModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data: NewTransactionData) => {
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, data);
      } else if (data.installmentTotal && data.installmentTotal >= 2) {
        // Parcelamento cria uma Recurrence + todas as parcelas de uma vez,
        // não um lançamento único.
        await api.post('/recurrences', {
          description: data.description,
          totalAmount: data.amount,
          type: data.type,
          categoryId: data.categoryId,
          startDate: data.date,
          kind: 'INSTALLMENT',
          installmentTotal: data.installmentTotal,
        });
      } else {
        await api.post('/transactions', data);
      }
      // Invalida em vez de mexer no array local: o lançamento só deve
      // aparecer na lista se cair dentro do período/filtros selecionados, e
      // outras páginas (Dashboard) que dependem de transações também precisam
      // saber que os dados mudaram.
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notify(editingTransaction ? 'Lançamento atualizado com sucesso!' : 'Lançamento adicionado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      notify(editingTransaction ? 'Erro ao atualizar lançamento. Tente novamente.' : 'Erro ao criar lançamento. Tente novamente.', 'error');
    }
  };

  // Otimista: some da lista e fecha o diálogo na hora; a paginação
  // (total/totalPages) é reconciliada em segundo plano após confirmar.
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    const listQueryKey = ['transactions', 'list', listParams];
    const previousData = queryClient.getQueryData(listQueryKey);

    queryClient.setQueryData(listQueryKey, (prev: typeof data) =>
      prev ? { ...prev, data: prev.data.filter((tx) => tx.id !== idToDelete) } : prev
    );
    setDeleteId(null);

    try {
      await api.delete(`/transactions/${idToDelete}`);
      notify('Lançamento excluído com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error) {
      console.error('Erro ao deletar lançamento:', error);
      queryClient.setQueryData(listQueryKey, previousData);
      notify('Erro ao excluir lançamento. Tente novamente.', 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Barra de Ações Superior */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={typeFilter}
              label="Tipo"
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="INCOME">Receita</MenuItem>
              <MenuItem value="EXPENSE">Despesa</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={categoryFilter}
              label="Categoria"
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="ALL">Todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreateModal}
          sx={{
            borderRadius: 2,
            px: 2.5,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          Novo Lançamento
        </Button>
      </Box>

      {/* Tabela de Transações */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Descrição</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Categoria</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Valor</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={5} columns={5} />
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <EmptyState
                        variant="plain"
                        icon={<ReceiptLongRoundedIcon />}
                        message="Nenhum lançamento encontrado neste período"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const CategoryIcon = getCategoryIconComponent(tx.category?.icon);

                  return (
                    <TableRow key={tx.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: isIncome ? 'success.light' : 'error.light',
                              color: isIncome ? 'success.dark' : 'error.dark',
                              opacity: 0.9,
                            }}
                          >
                            {isIncome ? (
                              <ArrowUpwardRoundedIcon fontSize="small" />
                            ) : (
                              <ArrowDownwardRoundedIcon fontSize="small" />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {tx.description}
                          </Typography>
                          {tx.installmentNumber && tx.recurrence?.installmentTotal && (
                            <Chip
                              label={`${tx.installmentNumber}/${tx.recurrence.installmentTotal}`}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'action.hover' }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={tx.category ? <CategoryIcon /> : undefined}
                          label={tx.category?.name || 'Sem categoria'}
                          size="small"
                          sx={{
                            borderRadius: 1.5,
                            bgcolor: 'action.hover',
                            color: 'text.primary',
                            fontWeight: 500,
                            '& .MuiChip-icon': { color: tx.category?.color },
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(tx.date)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isIncome ? 'success.main' : 'error.main',
                          }}
                        >
                          {isIncome ? `+ ${formatCurrency(tx.amount)}` : `- ${formatCurrency(tx.amount)}`}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleOpenEditModal(tx)}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="default" onClick={() => setDeleteId(tx.id)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
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

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      <TransactionModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        transaction={editingTransaction}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir lançamento"
        message="Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita."
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};