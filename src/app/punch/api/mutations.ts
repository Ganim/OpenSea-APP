import type { TimeEntry } from '@/types/hr';
import { useMutation } from '@tanstack/react-query';
import { punchApi, type PunchRequest } from './punch.api';

export function usePunchClockIn() {
  return useMutation<TimeEntry, Error, PunchRequest>({
    mutationFn: data => punchApi.clockIn(data),
  });
}

export function usePunchClockOut() {
  return useMutation<TimeEntry, Error, PunchRequest>({
    mutationFn: data => punchApi.clockOut(data),
  });
}
