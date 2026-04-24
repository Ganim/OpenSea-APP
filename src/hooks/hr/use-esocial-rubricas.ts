'use client';

/**
 * OpenSea OS - useEsocialRubricas (Phase 06 / Plan 06-06)
 *
 * Query + Upsert mutation do mapeamento CLT → codRubr (Plan 06-05).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { complianceService } from '@/services/hr/compliance.service';
import type {
  ListRubricaMapResponse,
  UpsertRubricaMapRequest,
} from '@/types/hr';

export const RUBRICA_MAP_QUERY_KEY = ['compliance', 'rubrica-map'] as const;

export function useListRubricaMap() {
  return useQuery<ListRubricaMapResponse>({
    queryKey: RUBRICA_MAP_QUERY_KEY,
    queryFn: () => complianceService.listRubricaMap(),
    staleTime: 60_000,
  });
}

export interface UpsertRubricaMapVars {
  concept: string;
  body: UpsertRubricaMapRequest;
}

export function useUpsertRubricaMap() {
  const queryClient = useQueryClient();
  return useMutation<
    { item: unknown; created: boolean },
    Error,
    UpsertRubricaMapVars
  >({
    mutationFn: ({ concept, body }) =>
      complianceService.upsertRubricaMap(concept, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RUBRICA_MAP_QUERY_KEY });
    },
  });
}
