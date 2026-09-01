import { TransactionType } from '@prisma/client';

export const DEFAULT_CATEGORIES: { name: string; color: string; icon: string; type: TransactionType }[] = [
  { name: 'Alimentação', color: '#F97316', icon: 'RestaurantRounded', type: 'EXPENSE' },
  { name: 'Aluguel', color: '#6366F1', icon: 'HomeRounded', type: 'EXPENSE' },
  { name: 'Transporte', color: '#0EA5E9', icon: 'DirectionsBusRounded', type: 'EXPENSE' },
  { name: 'Lazer', color: '#EC4899', icon: 'SportsEsportsRounded', type: 'EXPENSE' },
  { name: 'Saúde', color: '#EF4444', icon: 'LocalHospitalRounded', type: 'EXPENSE' },
  { name: 'Outros', color: '#6B7280', icon: 'MoreHorizRounded', type: 'EXPENSE' },
  { name: 'Salário', color: '#10B981', icon: 'BusinessCenterRounded', type: 'INCOME' },
  { name: 'Outros', color: '#6B7280', icon: 'MoreHorizRounded', type: 'INCOME' },
];
