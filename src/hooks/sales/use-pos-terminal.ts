import { useQuery } from '@tanstack/react-query';
import { posService } from '@/services/sales/pos.service';
import type { PosTerminal } from '@/types/sales';

const KEY = (id: string) => ['pos-terminal', id] as const;

/**
 * Fetches a single POS Terminal by id (Emporion Fase 1).
 *
 * Uses `GET /v1/pos/terminals/:id` (added by ADR 030 Phase A). The previous
 * implementation walked the paginated list endpoint as a workaround; with the
 * dedicated endpoint live, this is now O(1).
 */
export function usePosTerminal(id: string | null | undefined) {
  return useQuery({
    queryKey: KEY(id ?? ''),
    queryFn: async (): Promise<PosTerminal> => {
      if (!id) {
        throw new Error('Terminal id is required.');
      }
      const { terminal } = await posService.getTerminal(id);
      return terminal;
    },
    enabled: !!id,
  });
}
