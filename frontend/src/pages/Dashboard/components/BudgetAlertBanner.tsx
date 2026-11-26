import React from 'react';
import { Alert } from '@mui/material';
import { summarizeBudgets, buildBudgetSummaryMessage } from '../../../utils/budgetAlert';
import type { BudgetProgressItem } from '../types';

interface BudgetAlertBannerProps {
  items: BudgetProgressItem[];
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({ items }) => {
  const summary = summarizeBudgets(items);
  const message = buildBudgetSummaryMessage(summary);

  if (!message) return null;

  return (
    <Alert severity={summary.exceeded.length > 0 ? 'error' : 'warning'} sx={{ borderRadius: 2 }}>
      <strong>Orçamento do mês:</strong> {message}
    </Alert>
  );
};
