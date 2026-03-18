// ============================================
// LOCATION SEARCH API QUERIES
// ============================================

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS, API_ENDPOINTS } from './keys';
import type { LocationSearchResponse } from '@/types/stock';

/**
 * Hook para buscar itens por localização
 */
export function useLocationSearch(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.searchLocation(query),
    queryFn: async () => {
      const response = await apiClient.get<LocationSearchResponse>(
        API_ENDPOINTS.search.location,
        {
          params: { q: query, limit: '10' },
        }
      );
      return response;
    },
    enabled: query.length >= 2,
    staleTime: 0, // sempre fresco
  });
}
