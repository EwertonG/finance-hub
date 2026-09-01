import React from 'react';
import { Box, Card, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { EmptyState } from '../../../components/EmptyState';
import { TableSkeleton } from '../../../components/TableSkeleton';
import { getCategoryIconComponent } from '../../../constants/categoryIcons';
import { formatCurrency, formatDate } from '../utils';
import type { Transaction } from '../types';

interface RecentTransactionsTableProps {
  loading: boolean;
  transactions: Transaction[];
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ loading, transactions }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
        Últimos Lançamentos
      </Typography>
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Categoria</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyState
                      variant="plain"
                      icon={<ReceiptLongRoundedIcon />}
                      message="Nenhum lançamento registrado neste período"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.slice(0, 5).map((tx) => {
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
                            {isIncome ? <ArrowUpwardRoundedIcon fontSize="small" /> : <ArrowDownwardRoundedIcon fontSize="small" />}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {tx.description}
                          </Typography>
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
