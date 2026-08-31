import React from 'react';
import { Box, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import { StatCardSkeleton } from './StatCardSkeleton';
import { formatCurrency } from '../utils';
import type { DebtorSummary } from '../types';

interface DebtorsSummaryCardsProps {
  loading: boolean;
  debtorsSummary: DebtorSummary;
}

export const DebtorsSummaryCards: React.FC<DebtorsSummaryCardsProps> = ({ loading, debtorsSummary }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
        Cobranças (Devedores)
      </Typography>
      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <StatCardSkeleton />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark', display: 'flex' }}>
                    <HourglassEmptyRoundedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      A Receber (Pendente)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {formatCurrency(debtorsSummary.totalToReceive)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark', display: 'flex' }}>
                    <CheckCircleOutlineRoundedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Total Recebido (Pago)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(debtorsSummary.totalPaid)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.light', color: 'info.dark', display: 'flex' }}>
                    <PeopleAltRoundedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Total Dividido
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {formatCurrency(debtorsSummary.totalOverall)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};
