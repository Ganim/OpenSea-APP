'use client';

/**
 * OpenSea OS - useEsocialConfig (Phase 06 / Plan 06-06)
 *
 * Query + Update mutation da configuração eSocial, incluindo o novo
 * campo `inpiNumber` adicionado em Plan 06-05 (fecha D-06 — placeholder
 * '99999999999999999' do controller AFD pode ser removido quando
 * inpiNumber estiver configurado).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { complianceService } from '@/services/hr/compliance.service';
import type { EsocialConfigDto, UpdateEsocialConfigRequest } from '@/types/hr';

export const ESOCIAL_CONFIG_QUERY_KEY = [
  'compliance',
  'esocial-config',
] as const;

export function useEsocialConfig() {
  return useQuery<{ config: EsocialConfigDto }>({
    queryKey: ESOCIAL_CONFIG_QUERY_KEY,
    queryFn: () => complianceService.getEsocialConfig(),
    staleTime: 60_000,
  });
}

export function useUpdateEsocialConfig() {
  const queryClient = useQueryClient();
  return useMutation<
    { config: EsocialConfigDto },
    Error,
    UpdateEsocialConfigRequest
  >({
    mutationFn: body => complianceService.updateEsocialConfig(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESOCIAL_CONFIG_QUERY_KEY });
    },
  });
}
