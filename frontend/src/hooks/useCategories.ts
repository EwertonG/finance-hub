import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
}

// Categorias mudam pouco, então ficam num staleTime bem maior que o padrão
// global — evita refetch a cada abertura de modal (Transação, Devedor,
// Assinatura) e a cada visita à página de Categorias.
export function useCategories(type?: 'INCOME' | 'EXPENSE') {
  return useQuery({
    queryKey: ['categories', type ?? 'ALL'],
    queryFn: async () => {
      const response = await api.get<Category[]>('/categories', {
        params: type ? { type } : undefined,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
