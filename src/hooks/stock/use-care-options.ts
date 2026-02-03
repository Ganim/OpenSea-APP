import { careService } from '@/services/stock';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook para buscar todas as opções de instruções de cuidado
 * Resultado é cacheado indefinidamente pois o catálogo não muda frequentemente
 */
export function useCareOptions() {
  return useQuery({
    queryKey: ['care-options'],
    queryFn: async () => {
      const response = await careService.listCareOptions();
      return response.options;
    },
    staleTime: Infinity, // Catálogo não muda frequentemente
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}
