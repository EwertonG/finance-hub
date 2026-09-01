export interface Summary {
  income: number;
  expense: number;
  total: number;
}

export interface DebtorSummary {
  totalPending: number;
  totalCharged: number;
  totalPaid: number;
  totalToReceive: number;
  totalOverall: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: { name: string; color: string; icon: string } | null;
  date: string;
}

export interface MonthSummary {
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface GoalSummary {
  id: string;
  name: string;
  color: string;
  progress: number;
  completed: boolean;
}

export interface SubscriptionSummary {
  active: boolean;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

export interface CategoryBreakdownItem {
  name: string;
  amount: number;
  percentage: number;
}
