import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTerminalEvents } from './use-terminal-events';
import type { PosTerminal, PosTerminalsResponse } from '@/types/sales';

const mockOn =
  vi.fn<(event: string, handler: (...args: unknown[]) => void) => void>();
let registered: Record<string, (...args: unknown[]) => void> = {};

vi.mock('./use-admin-pos-socket', () => ({
  useAdminPosSocket: () => ({
    isConnected: true,
    on: (event: string, handler: (...args: unknown[]) => void) => {
      mockOn(event, handler);
      registered[event] = handler;
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: { info: vi.fn() },
}));

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  qc.setQueryData<PosTerminalsResponse>(['pos-terminals', undefined], {
    data: [
      {
        id: 't1',
        terminalName: 'Caixa 01',
        lastCatalogSyncAt: null,
        pendingSales: 0,
      } as unknown as PosTerminal,
      {
        id: 't2',
        terminalName: 'Caixa 02',
        lastCatalogSyncAt: null,
        pendingSales: 0,
      } as unknown as PosTerminal,
    ],
    meta: { total: 2, page: 1, limit: 20, pages: 1 },
  });
  return {
    qc,
    Wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  };
}

describe('useTerminalEvents', () => {
  beforeEach(() => {
    registered = {};
    mockOn.mockClear();
  });

  it('subscribes to terminal.synced/unpaired/paired', () => {
    const { Wrapper } = makeWrapper();
    renderHook(() => useTerminalEvents(), { wrapper: Wrapper });

    expect(Object.keys(registered).sort()).toEqual([
      'terminal.paired',
      'terminal.synced',
      'terminal.unpaired',
    ]);
  });

  it('terminal.synced patches the matching row in the cache', () => {
    const { qc, Wrapper } = makeWrapper();
    renderHook(() => useTerminalEvents(), { wrapper: Wrapper });

    act(() => {
      registered['terminal.synced']({
        terminalId: 't1',
        lastCatalogSyncAt: '2026-04-29T12:00:00.000Z',
        pendingSales: 5,
        conflictSales: 0,
      });
    });

    const cache = qc.getQueryData<PosTerminalsResponse>([
      'pos-terminals',
      undefined,
    ]);
    expect(cache?.data[0].lastCatalogSyncAt).toBe('2026-04-29T12:00:00.000Z');
    expect(cache?.data[0].pendingSales).toBe(5);
    expect(cache?.data[1].pendingSales).toBe(0);
  });

  it('terminal.unpaired invalidates and shows toast', async () => {
    const { qc, Wrapper } = makeWrapper();
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
    const { toast } = await import('sonner');
    renderHook(() => useTerminalEvents(), { wrapper: Wrapper });

    act(() => {
      registered['terminal.unpaired']({
        terminalId: 't1',
        terminalName: 'Caixa 01',
        reason: 'admin-revoked',
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['pos-terminals'] });
    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining('Caixa 01')
    );
  });

  it('terminal.paired invalidates the cache', () => {
    const { qc, Wrapper } = makeWrapper();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    renderHook(() => useTerminalEvents(), { wrapper: Wrapper });

    act(() => {
      registered['terminal.paired']({
        terminalId: 't3',
        terminalName: 'Caixa 03',
      });
    });

    expect(spy).toHaveBeenCalledWith({ queryKey: ['pos-terminals'] });
  });
});
