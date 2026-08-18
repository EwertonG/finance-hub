import React, { useState } from 'react';
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
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
}

// Dados temporários
const initialTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Salário Mensal',
    amount: 5500.0,
    type: 'INCOME',
    category: 'Trabalho',
    date: '2026-08-05',
  },
  {
    id: '2',
    description: 'Supermercado',
    amount: 642.5,
    type: 'EXPENSE',
    category: 'Alimentação',
    date: '2026-08-10',
  },
  {
    id: '3',
    description: 'Internet Fibra',
    amount: 129.9,
    type: 'EXPENSE',
    category: 'Contas',
    date: '2026-08-12',
  },
];

export const Transactions: React.FC = () => {
  const theme = useTheme();
  const [transactions] = useState<Transaction[]>(initialTransactions);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Barra de Ações Superior */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
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
                          label={tx.category}
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
                        <IconButton size="small" color="default">
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
    </Box>
  );
};