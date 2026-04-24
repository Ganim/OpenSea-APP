'use client';

/**
 * OpenSea OS - useGenerateAfdt (Phase 06 / Plan 06-06)
 *
 * D-05: AFDT é artefato proprietário — UI mostra banner obrigatório.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { complianceService } from '@/services/hr/compliance.service';
import type { GenerateAfdtRequest, GenerateArtifactResponse } from '@/types/hr';

export function useGenerateAfdt() {
  const queryClient = useQueryClient();
  return useMutation<GenerateArtifactResponse, Error, GenerateAfdtRequest>({
    mutationFn: body => complianceService.generateAfdt(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-artifacts'] });
    },
  });
}
