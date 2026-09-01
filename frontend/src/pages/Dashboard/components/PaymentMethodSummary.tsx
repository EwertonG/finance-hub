import React from 'react';
import { Box, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import { StatCardSkeleton } from './StatCardSkeleton';
import { formatCurrency } from '../utils';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_ICONS, type PaymentMethod } from '../../../constants/paymentMethods';

interface PaymentMethodSummaryProps {
  loading: boolean;
  amountByMethod: Partial<Record<PaymentMethod, number>>;
}

// "Fatura do cartão" e "saldo em débito" são exatamente a soma de despesas
// do período por forma de pagamento — por isso cada card já é lido como
// "quanto está" aquele meio de pagamento no período selecionado.
export const PaymentMethodSummary: React.FC<PaymentMethodSummaryProps> = ({ loading, amountByMethod }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
        Gastos por Forma de Pagamento
      </Typography>
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <StatCardSkeleton />
              </Grid>
            ))
          : PAYMENT_METHODS.map((method) => {
              const Icon = PAYMENT_METHOD_ICONS[method];
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={method}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          display: 'flex',
                          flexShrink: 0,
                          bgcolor: 'primary.light',
                          color: 'primary.dark',
                        }}
                      >
                        <Icon />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {PAYMENT_METHOD_LABELS[method]}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {formatCurrency(amountByMethod[method] ?? 0)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
      </Grid>
    </Box>
  );
};
