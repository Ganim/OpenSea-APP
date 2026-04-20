'use client';

/**
 * OpenSea OS - QR Rotation Progress Hook
 *
 * Socket.IO subscription for the `punch.qr_rotation.progress` event emitted
 * by the backend `qr-batch-worker` (plan 05-04) on the `tenant:{id}:hr` room.
 *
 * Also watches for the completion event emitted by the Phase 5 typed event
 * bus (`punch.qr_rotation.completed`) so the Drawer can flip to its success
 * state without an extra round-trip to the notifications API.
 *
 * Server emits ONLY to the current user's tenant room (see RoomLeak-01
 * mitigation in plan 05-09 threat model); this hook does not need to do any
 * tenant filtering on the client.
 *
 * Events for a different jobId are ignored — two concurrent bulk jobs won't
 * cross streams.
 */

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import type { QrRotationProgress } from '@/types/hr';

export interface UseQrRotationProgressResult {
  /** Most recent progress ping for the watched jobId, or null if none yet. */
  progress: QrRotationProgress | null;
  /** True after a `punch.qr_rotation.completed` event is observed for this
   * jobId (or after a progress ping hits 100%). */
  jobDone: boolean;
}

interface QrRotationCompletedPayload {
  jobId: string;
  processed: number;
  total: number;
  generatedPdfs?: boolean;
  bulkPdfDownloadUrl?: string | null;
}

export function useQrRotationProgress(
  jobId: string | null
): UseQrRotationProgressResult {
  const [progress, setProgress] = useState<QrRotationProgress | null>(null);
  const [jobDone, setJobDone] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    // Reset state when jobId changes (new bulk operation started).
    setProgress(null);
    setJobDone(false);
  }, [jobId]);

  useEffect(() => {
    if (!jobId || !socket) return;

    const onProgress = (data: QrRotationProgress) => {
      if (data.jobId !== jobId) return;
      setProgress(data);
      if (data.percent >= 100) {
        setJobDone(true);
      }
    };

    const onCompleted = (data: QrRotationCompletedPayload) => {
      if (data.jobId !== jobId) return;
      setJobDone(true);
      // Backfill progress to 100% in case we missed the final tick.
      setProgress(prev => ({
        jobId: data.jobId,
        processed: data.processed ?? prev?.processed ?? 0,
        total: data.total ?? prev?.total ?? 0,
        percent: 100,
      }));
    };

    socket.on('punch.qr_rotation.progress', onProgress);
    socket.on('punch.qr_rotation.completed', onCompleted);

    return () => {
      socket.off('punch.qr_rotation.progress', onProgress);
      socket.off('punch.qr_rotation.completed', onCompleted);
    };
  }, [jobId, socket]);

  return { progress, jobDone };
}
