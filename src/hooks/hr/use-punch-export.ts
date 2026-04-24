'use client';

/**
 * usePunchExport — mutation that dispatches a punch export job.
 * Phase 7 / Plan 07-06 / Task 1.
 *
 * Returns either `mode='sync'` (small range — server includes downloadUrl)
 * or `mode='async'` (large range — jobId for the worker). The caller is
 * responsible for opening the URL or showing the queued toast.
 *
 * No silent fallbacks — backend errors flow through to `onError`.
 */

import { useMutation } from '@tanstack/react-query';
import {
  punchExportService,
  type PunchExportInput,
  type PunchExportResponse,
} from '@/services/hr/punch-export.service';

export function usePunchExport() {
  return useMutation<PunchExportResponse, Error, PunchExportInput>({
    mutationFn: input => punchExportService.dispatchExport(input),
  });
}
