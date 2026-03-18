// ============================================
// LOCATION SETUP API MUTATIONS
// ============================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS, API_ENDPOINTS } from './keys';
import type {
  LocationSetupRequest,
  LocationSetupResponse,
} from '@/types/stock';

/**
 * Hook para configurar armazém com zonas e bins em uma única operação
 */
export function useLocationSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LocationSetupRequest) => {
      const response = await apiClient.post<LocationSetupResponse>(
        API_ENDPOINTS.setup.create,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.warehouses });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.health });
    },
  });
}
