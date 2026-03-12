import { authService } from '@/services';
import { useQuery } from '@tanstack/react-query';

/**
 * Runs idempotent routine checks periodically while user is authenticated.
 * Fire-and-forget: results are not used by UI, they trigger backend side-effects
 * (mark overdue finance entries, process calendar reminders).
 */
export function useRoutineCheck(enabled = true) {
  return useQuery({
    queryKey: ['routine-check'],
    queryFn: () => authService.routineCheck(),
    enabled,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 4 * 60 * 1000,
  });
}
