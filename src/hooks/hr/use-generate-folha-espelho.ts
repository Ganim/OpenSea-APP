'use client';

/**
 * OpenSea OS - useGenerateFolhaEspelho (individual + bulk — Phase 06 Plan 06-06)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { complianceService } from '@/services/hr/compliance.service';
import type {
  GenerateArtifactResponse,
  GenerateFolhaEspelhoBulkRequest,
  GenerateFolhaEspelhoBulkResponse,
  GenerateFolhaEspelhoRequest,
} from '@/types/hr';

export function useGenerateFolhaEspelho() {
  const queryClient = useQueryClient();
  return useMutation<
    GenerateArtifactResponse,
    Error,
    GenerateFolhaEspelhoRequest
  >({
    mutationFn: body => complianceService.generateFolhaEspelho(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-artifacts'] });
    },
  });
}

export function useGenerateFolhaEspelhoBulk() {
  return useMutation<
    GenerateFolhaEspelhoBulkResponse,
    Error,
    GenerateFolhaEspelhoBulkRequest
  >({
    mutationFn: body => complianceService.generateFolhaEspelhoBulk(body),
  });
}
