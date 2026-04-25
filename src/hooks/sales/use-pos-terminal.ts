import { useQuery } from '@tanstack/react-query';
import { posService } from '@/services/sales/pos.service';
import type { PosTerminal } from '@/types/sales';

const KEY = (id: string) => ['pos-terminal', id] as const;

/**
 * Fetches a single POS Terminal by id (Emporion Fase 1).
 *
 * The OpenSea-API does not yet expose `GET /v1/pos/terminals/:id` as a
 * dedicated endpoint, so we resolve it client-side by paging through the
 * existing list endpoint until the terminal is found. The result is cached
 * under `['pos-terminal', id]` so configuration screens that mutate the
 * terminal can invalidate just this entry without touching the global list.
 */
export function usePosTerminal(id: string | null | undefined) {
  return useQuery({
    queryKey: KEY(id ?? ''),
    queryFn: async (): Promise<PosTerminal> => {
      if (!id) {
        throw new Error('Terminal id is required.');
      }
      // Backend list endpoint is paginated. We walk the pages until we either
      // find the terminal or exhaust the list — typical tenants have a small
      // number of terminals so this is fine in practice.
      let page = 1;
      const limit = 100;
      // Hard cap to avoid pathological loops on a misconfigured backend.
      for (let i = 0; i < 50; i += 1) {
        const response = await posService.listTerminals({ page, limit });
        const match = response.data.find(t => t.id === id);
        if (match) {
          return match;
        }
        if (response.meta.page >= response.meta.pages) {
          break;
        }
        page += 1;
      }
      throw new Error('Terminal não encontrado.');
    },
    enabled: !!id,
  });
}
