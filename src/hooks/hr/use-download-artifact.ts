'use client';

/**
 * OpenSea OS - useDownloadArtifact (Phase 06 / Plan 06-06)
 *
 * Mutation que busca presigned URL (TTL 15min) do artefato de compliance
 * e abre via `window.open(url)`. O backend aplica Content-Disposition
 * amigável por tipo (AFD_{CNPJ}_..., Folha_Espelho_..., etc.) e grava
 * audit log COMPLIANCE_ARTIFACT_DOWNLOADED.
 *
 * Requires permission `hr.compliance.artifact.download`.
 */

import { useMutation } from '@tanstack/react-query';
import { complianceService } from '@/services/hr/compliance.service';
import type { ComplianceArtifactDownloadResponse } from '@/types/hr';

export function useDownloadArtifact() {
  return useMutation<ComplianceArtifactDownloadResponse, Error, string>({
    mutationFn: async (artifactId: string) => {
      const result = await complianceService.getDownloadUrl(artifactId);
      if (typeof window !== 'undefined' && result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      }
      return result;
    },
  });
}
