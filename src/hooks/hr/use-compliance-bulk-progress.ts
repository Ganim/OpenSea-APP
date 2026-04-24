'use client';

/**
 * OpenSea OS - useComplianceBulkProgress (Phase 06 / Plan 06-06)
 *
 * Socket.IO subscription para o worker `folha-espelho-bulk-worker` (Plan
 * 06-04). Backend emite `compliance.folha_espelho.progress` durante o lote
 * e `compliance.folha_espelho.completed` ao final, na room
 * `tenant:{id}:hr`.
 *
 * Eventos de outros `bulkJobId` são ignorados — dois lotes concorrentes
 * nunca cruzam streams.
 */

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import type { ComplianceBulkProgressEvent } from '@/types/hr';

export interface UseComplianceBulkProgressResult {
  /** Último ping recebido para o bulkJobId vigiado, ou null. */
  progress: ComplianceBulkProgressEvent | null;
  /** True após `compliance.folha_espelho.completed` OU progress.status==='completed'. */
  jobDone: boolean;
}

export function useComplianceBulkProgress(
  bulkJobId: string | null
): UseComplianceBulkProgressResult {
  const [progress, setProgress] = useState<ComplianceBulkProgressEvent | null>(
    null
  );
  const [jobDone, setJobDone] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    // Reset ao trocar de job.
    setProgress(null);
    setJobDone(false);
  }, [bulkJobId]);

  useEffect(() => {
    if (!bulkJobId || !socket) return;

    const onProgress = (data: ComplianceBulkProgressEvent) => {
      if (data.bulkJobId !== bulkJobId) return;
      setProgress(data);
      if (data.status === 'completed') {
        setJobDone(true);
      }
    };

    const onCompleted = (data: ComplianceBulkProgressEvent) => {
      if (data.bulkJobId !== bulkJobId) return;
      setJobDone(true);
      setProgress(prev => ({
        bulkJobId: data.bulkJobId,
        total: data.total ?? prev?.total ?? 0,
        success: data.success ?? prev?.success ?? 0,
        failed: data.failed ?? prev?.failed ?? 0,
        status: 'completed',
      }));
    };

    socket.on('compliance.folha_espelho.progress', onProgress);
    socket.on('compliance.folha_espelho.completed', onCompleted);

    return () => {
      socket.off('compliance.folha_espelho.progress', onProgress);
      socket.off('compliance.folha_espelho.completed', onCompleted);
    };
  }, [bulkJobId, socket]);

  return { progress, jobDone };
}
