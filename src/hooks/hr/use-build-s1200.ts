'use client';

/**
 * OpenSea OS - useBuildS1200 (Phase 06 / Plan 06-06)
 *
 * Submissão regulatória — sempre gate-da por VerifyActionPinModal antes
 * da mutation.mutateAsync. Ver S1200SubmitForm.tsx.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { complianceService } from '@/services/hr/compliance.service';
import type { BuildS1200Request, BuildS1200Response } from '@/types/hr';

export function useBuildS1200() {
  const queryClient = useQueryClient();
  return useMutation<BuildS1200Response, Error, BuildS1200Request>({
    mutationFn: body => complianceService.buildS1200(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-artifacts'] });
    },
  });
}
