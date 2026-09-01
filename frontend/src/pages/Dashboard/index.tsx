import React from 'react';
import { Box, Grid } from '@mui/material';
import { useDashboardData } from './hooks/useDashboardData';
import { MONTH_LABELS } from './utils';
import { SummaryCards } from './components/SummaryCards';
import { EvolutionChart } from './components/EvolutionChart';
import { CommitmentsSummary } from './components/CommitmentsSummary';
import { PaymentMethodSummary } from './components/PaymentMethodSummary';
import { CategoryBudgetSection } from './components/CategoryBudgetSection';
import { GoalsSection } from './components/GoalsSection';
import { RecentTransactionsTable } from './components/RecentTransactionsTable';
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart';

export const Dashboard: React.FC = () => {
  const {
    month,
    year,
    viewMode,
    loading,
    summary,
    previousSummary,
    debtorsSummary,
    periodTransactions,
    evolutionData,
    categoryLoading,
    categoryBreakdown,
    goalsLoading,
    goals,
    subscriptionsLoading,
    subscriptions,
    budgetLoading,
    budgetProgress,
    paymentMethodLoading,
    amountByMethod,
  } = useDashboardData();

  const periodLabel = viewMode === 'monthly' ? `${MONTH_LABELS[month - 1]}/${year}` : `${year}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <SummaryCards loading={loading} summary={summary} previousSummary={previousSummary} periodLabel={periodLabel} />

      <EvolutionChart loading={loading} year={year} data={evolutionData} />

      <CommitmentsSummary
        debtorsLoading={loading}
        debtorsSummary={debtorsSummary}
        subscriptionsLoading={subscriptionsLoading}
        subscriptions={subscriptions}
      />

      <PaymentMethodSummary loading={paymentMethodLoading} amountByMethod={amountByMethod} />

      <CategoryBudgetSection loading={budgetLoading} items={budgetProgress} periodLabel={periodLabel} />

      <GoalsSection loading={goalsLoading} goals={goals} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <RecentTransactionsTable loading={loading} transactions={periodTransactions} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <CategoryBreakdownChart loading={categoryLoading} data={categoryBreakdown} periodLabel={periodLabel} />
        </Grid>
      </Grid>
    </Box>
  );
};
