import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget: number | null;
  createdAt: string;
}

export const CATEGORIES_QUERY_KEY = ['categories'];

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<Category[]>('/categories');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
