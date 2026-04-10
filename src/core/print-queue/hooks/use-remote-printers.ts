'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { apiClient } from '@/lib/api-client';
import type { RemotePrinter, PrinterStatus } from '@/types/sales';

export function useRemotePrinters() {
  const { on, isConnected } = useSocket();
  const [liveStatuses, setLiveStatuses] = useState<
    Record<string, PrinterStatus>
  >({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['remote-printers'],
    queryFn: async () => {
      const response = await apiClient.get<{ printers: RemotePrinter[] }>(
        '/v1/sales/printers'
      );
      return response.printers;
    },
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!isConnected) return;

    const unsub = on<{
      printerId: string;
      status: PrinterStatus;
      agentName: string;
      agentId: string;
      lastSeenAt: string;
    }>('printer:status', payload => {
      setLiveStatuses(prev => ({
        ...prev,
        [payload.printerId]: payload.status,
      }));
    });

    return unsub;
  }, [isConnected, on]);

  const printers: RemotePrinter[] = (data ?? []).map(p => ({
    ...p,
    status: liveStatuses[p.id] ?? p.status,
  }));

  const onlinePrinters = printers.filter(p => p.status === 'ONLINE');
  const hasOnlinePrinter = onlinePrinters.length > 0;

  return {
    printers,
    onlinePrinters,
    hasOnlinePrinter,
    isLoading,
    error,
    refetch,
    isSocketConnected: isConnected,
  };
}
