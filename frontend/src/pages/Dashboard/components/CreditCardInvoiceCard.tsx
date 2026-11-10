import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import { api } from '../../../services/api';
import { formatCurrency } from '../utils';

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

interface InvoiceTransaction {
  id: string;
  description: string;
  amount: string;
  date: string;
  installmentNumber: number | null;
  recurrence: { kind: 'INSTALLMENT' | 'SUBSCRIPTION'; installmentTotal: number | null } | null;
  category: { name: string } | null;
}

type Invoice =
  | { configured: false }
  | {
      configured: true;
      total: number;
      closingDate: string;
      dueDate: string;
      periodStart: string;
      periodEnd: string;
      transactions: InvoiceTransaction[];
    };

const formatDay = (iso: string) => {
  const [, month, day] = iso.slice(0, 10).split('-');
  return `${day}/${month}`;
};

interface CreditCardInvoiceCardProps {
  month: number;
  year: number;
}

export const CreditCardInvoiceCard: React.FC<CreditCardInvoiceCardProps> = ({ month, year }) => {
  const theme = useTheme();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['transactions', 'credit-card-invoice', month, year],
    queryFn: async () => {
      const response = await api.get<Invoice>('/credit-card/invoice', { params: { month, year } });
      return response.data;
    },
  });

  const cardSx = { borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` };
  const title = `Fatura do cartão de ${MONTH_NAMES[month - 1]}`;

  if (isLoading || !invoice) {
    return (
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton width="40%" />
          <Skeleton width="25%" height={40} />
          <Skeleton width="60%" />
        </CardContent>
      </Card>
    );
  }

  if (!invoice.configured) {
    return (
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ p: 1.5, borderRadius: 2, display: 'flex', bgcolor: 'primary.light', color: 'primary.dark' }}>
            <CreditCardRoundedIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Veja a fatura real do seu cartão
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Informe os dias de fechamento e vencimento para separar as compras na fatura certa.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/profile"
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Configurar cartão
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isClosed = new Date().toISOString().slice(0, 10) >= invoice.closingDate.slice(0, 10);

  return (
    <>
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ p: 1.5, borderRadius: 2, display: 'flex', bgcolor: 'primary.light', color: 'primary.dark' }}>
            <CreditCardRoundedIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              <Chip
                label={isClosed ? 'Fechada' : 'Aberta'}
                size="small"
                color={isClosed ? 'default' : 'primary'}
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatCurrency(invoice.total)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fecha em {formatDay(invoice.closingDate)} · Vence em {formatDay(invoice.dueDate)} · Compras de{' '}
              {formatDay(invoice.periodStart)} a {formatDay(invoice.periodEnd)}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setIsDetailsOpen(true)}
            disabled={invoice.transactions.length === 0}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {invoice.transactions.length === 0
              ? 'Nenhuma compra'
              : `Ver ${invoice.transactions.length} ${invoice.transactions.length === 1 ? 'compra' : 'compras'}`}
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {title} · {formatCurrency(invoice.total)}
        </DialogTitle>
        <DialogContent>
          <List dense disablePadding>
            {invoice.transactions.map((transaction) => {
              const installment =
                transaction.installmentNumber && transaction.recurrence?.installmentTotal
                  ? ` · parcela ${transaction.installmentNumber}/${transaction.recurrence.installmentTotal}`
                  : '';
              return (
                <ListItem key={transaction.id} disableGutters divider>
                  <ListItemText
                    primary={transaction.description}
                    secondary={`${formatDay(transaction.date)} · ${transaction.category?.name ?? 'Sem categoria'}${installment}`}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, ml: 2, whiteSpace: 'nowrap' }}>
                    {formatCurrency(Number(transaction.amount))}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};
