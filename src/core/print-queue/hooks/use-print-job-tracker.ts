'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { printJobsService } from '@/services/sales/print-jobs.service';
import type { PrintJobStatus } from '@/types/sales';

interface TrackedJob {
  jobId: string;
  printerName: string;
  copies: number;
  status: PrintJobStatus;
  error?: string;
  completedAt?: string;
}

export type { TrackedJob };

export function usePrintJobTracker() {
  const { on, isConnected } = useSocket();
  const [activeJobs, setActiveJobs] = useState<TrackedJob[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    const unsub = on<{
      jobId: string;
      status: PrintJobStatus;
      completedAt?: string;
      error?: string;
    }>('job:update', payload => {
      setActiveJobs(prev =>
        prev.map(job =>
          job.jobId === payload.jobId
            ? {
                ...job,
                status: payload.status,
                error: payload.error,
                completedAt: payload.completedAt,
              }
            : job
        )
      );
    });

    return unsub;
  }, [isConnected, on]);

  const addJob = useCallback((job: TrackedJob) => {
    setActiveJobs(prev => [job, ...prev]);
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setActiveJobs(prev => prev.filter(j => j.jobId !== jobId));
  }, []);

  const retryJob = useCallback(async (jobId: string) => {
    const result = await printJobsService.retry(jobId);
    setActiveJobs(prev =>
      prev.map(j =>
        j.jobId === jobId
          ? {
              ...j,
              jobId: result.jobId,
              status: 'QUEUED' as PrintJobStatus,
              error: undefined,
            }
          : j
      )
    );
  }, []);

  const cancelJob = useCallback(async (jobId: string) => {
    await printJobsService.cancel(jobId);
    setActiveJobs(prev =>
      prev.map(j =>
        j.jobId === jobId ? { ...j, status: 'CANCELLED' as PrintJobStatus } : j
      )
    );
  }, []);

  // Auto-remove completed/cancelled jobs after 10s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveJobs(prev =>
        prev.filter(j => {
          if (j.status === 'SUCCESS' || j.status === 'CANCELLED') {
            const completed = j.completedAt
              ? new Date(j.completedAt).getTime()
              : Date.now();
            return Date.now() - completed < 10000;
          }
          return true;
        })
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return { activeJobs, addJob, removeJob, retryJob, cancelJob };
}
