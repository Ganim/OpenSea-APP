import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { periodLocksService } from '@/services/finance/period-locks.service';

const QUERY_KEY = ['finance-period-locks'] as const;

export function usePeriodLocks(year: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, year],
    queryFn: () => periodLocksService.list({ year }),
  });
}

export function useCreatePeriodLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { year: number; month: number; reason?: string }) =>
      periodLocksService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useReleasePeriodLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => periodLocksService.release(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
