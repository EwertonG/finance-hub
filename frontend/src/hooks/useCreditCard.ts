import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface CreditCard {
  id: string;
  name: string;
  closingDay: number;
  dueDay: number;
}

export const CREDIT_CARD_QUERY_KEY = ['credit-card'];

export function useCreditCard() {
  return useQuery({
    queryKey: CREDIT_CARD_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<CreditCard | null>('/credit-card');
      return response.data;
    },
  });
}
