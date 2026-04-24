'use client';

/**
 * OpenSea OS - useGenerateAfd (Phase 06 / Plan 06-06)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { complianceService } from '@/services/hr/compliance.service';
import type { GenerateAfdRequest, GenerateArtifactResponse } from '@/types/hr';

export function useGenerateAfd() {
  const queryClient = useQueryClient();
  return useMutation<GenerateArtifactResponse, Error, GenerateAfdRequest>({
    mutationFn: body => complianceService.generateAfd(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-artifacts'] });
    },
  });
}
