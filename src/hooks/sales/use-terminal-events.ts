'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  PosTerminal,
  PosTerminalsResponse,
  TerminalSyncedEvent,
  TerminalUnpairedEvent,
  TerminalPairedEvent,
} from '@/types/sales';
import { useAdminPosSocket } from './use-admin-pos-socket';

/**
 * Subscribes to backend `/admin/pos` WS events and reactively patches the
 * `['pos-terminals', ...]` React Query caches without triggering a refetch.
 *
 * - `terminal.synced` → surgical patch of `lastCatalogSyncAt` / `pendingSales`
 *   on the matching row in every cached list variant (params-aware).
 * - `terminal.unpaired` → invalidate + user-facing toast.
 * - `terminal.paired` → invalidate (a brand-new terminal will only show up
 *   after a refetch).
 */
export function useTerminalEvents(): void {
  const queryClient = useQueryClient();
  const { on } = useAdminPosSocket();

  useEffect(() => {
    const onSynced = (raw: unknown) => {
      const e = raw as TerminalSyncedEvent;

      // Patch every cached `['pos-terminals', ...]` query variant. The page
      // hook stores responses under `[...POS_KEYS.terminals, params]`, so we
      // walk all matching caches and update the row in-place.
      queryClient.setQueriesData<PosTerminalsResponse>(
        { queryKey: ['pos-terminals'] },
        old => {
          if (!old?.data) return old;
          let touched = false;
          const next = old.data.map((t: PosTerminal) => {
            if (t.id !== e.terminalId) return t;
            touched = true;
            return {
              ...t,
              lastCatalogSyncAt: e.lastCatalogSyncAt,
              pendingSales: e.pendingSales,
              conflictSales: e.conflictSales,
            };
          });
          return touched ? { ...old, data: next } : old;
        }
      );

      // Also patch the legacy bare-array cache shape some tests / future
      // consumers may use (`['pos-terminals']` returning `PosTerminal[]`).
      queryClient.setQueryData<PosTerminal[] | undefined>(
        ['pos-terminals'],
        old =>
          old
            ? old.map(t =>
                t.id === e.terminalId
                  ? {
                      ...t,
                      lastCatalogSyncAt: e.lastCatalogSyncAt,
                      pendingSales: e.pendingSales,
                      conflictSales: e.conflictSales,
                    }
                  : t
              )
            : old
      );
    };

    const onUnpaired = (raw: unknown) => {
      const e = raw as TerminalUnpairedEvent;
      queryClient.invalidateQueries({ queryKey: ['pos-terminals'] });
      toast.info(`Terminal "${e.terminalName}" foi desvinculado`);
    };

    const onPaired = (_raw: unknown) => {
      const _e = _raw as TerminalPairedEvent;
      queryClient.invalidateQueries({ queryKey: ['pos-terminals'] });
    };

    on('terminal.synced', onSynced);
    on('terminal.unpaired', onUnpaired);
    on('terminal.paired', onPaired);
    // Cleanup is handled inside useAdminPosSocket via handlersRef.
  }, [queryClient, on]);
}
