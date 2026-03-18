// ============================================
// LOCATION HEALTH API QUERIES
// ============================================

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS, API_ENDPOINTS } from './keys';
import type { LocationHealthSummary } from '@/types/stock';

/**
 * Hook para obter o resumo de saúde das localizações
 */
export function useLocationHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: async () => {
      const response = await apiClient.get<LocationHealthSummary>(
        API_ENDPOINTS.health.summary
      );
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
