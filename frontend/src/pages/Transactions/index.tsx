import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
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
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { TransactionModal } from './components/TransactionModal';
import type { NewTransactionData } from './components/TransactionModal';
import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { usePeriod } from '../../contexts/PeriodContext';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: {name: string} | null;
  date: string;
}

export const Transactions: React.FC = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const { notify } = useNotification();
  const { month, year, viewMode } = usePeriod();

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      // Em modo mensal filtra pelo mês corrente; em modo anual usa o ano
      // inteiro (o backend aceita "year" sozinho para esse caso).
      const periodParams = viewMode === 'monthly' ? { month, year } : { year };
      const response = await api.get('/transactions', { params: periodParams });
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error);
      notify('Erro ao carregar lançamentos. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
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

  const handleAddTransaction = async (data: NewTransactionData) => {
    try {
      await api.post('/transactions', data);
      // Recarrega da API em vez de inserir localmente: o novo lançamento só
      // deve aparecer na lista se cair dentro do período selecionado.
      await loadTransactions();
      notify('Lançamento adicionado com sucesso!', 'success');
    } catch (error) {
      console.error ('Erro ao criar lançamento:', error);
      notify('Erro ao criar lançamento. Tente novamente.', 'error');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const isConfirmed = window.confirm('Tem certeza que deseja excluir este lançamento?');
    if (!isConfirmed) return;

    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      notify('Lançamento excluído com sucesso!', 'success');
    } catch (error) {
      console.error ('Erro ao deletar lançamento:', error);
      notify('Erro ao excluir lançamento. Tente novamente.', 'error');
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [month, year, viewMode]);

if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 240,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Barra de Ações Superior */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setIsModalOpen(true)}
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
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';

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
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={tx.category?.name || 'Sem categoria'} 
                          size="small"
                          sx={{
                            borderRadius: 1.5,
                            bgcolor: 'action.hover',
                            color: 'text.primary',
                            fontWeight: 500,
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
                        <IconButton 
                            size="small" 
                            color="default"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <TransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </Box>
  );
};