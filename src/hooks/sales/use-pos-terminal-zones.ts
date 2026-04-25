import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { posTerminalZonesService } from '@/services/sales/pos-terminal-zones.service';
import type { PosZoneTier } from '@/types/sales';

const KEYS = {
  all: ['pos-terminal-zones'] as const,
  list: (terminalId: string) => [...KEYS.all, terminalId] as const,
};

/**
 * Lists the Zones linked to a POS Terminal with their tier (PRIMARY or
 * SECONDARY) and the related Zone metadata (Fase 1).
 */
export function usePosTerminalZones(terminalId: string) {
  return useQuery({
    queryKey: KEYS.list(terminalId),
    queryFn: () => posTerminalZonesService.list(terminalId),
    enabled: !!terminalId,
  });
}

export function useAssignTerminalZone(terminalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ zoneId, tier }: { zoneId: string; tier: PosZoneTier }) =>
      posTerminalZonesService.assign(terminalId, zoneId, tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.list(terminalId) });
      toast.success('Zona vinculada ao terminal.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Erro ao vincular zona.';
      toast.error(message);
    },
  });
}

export function useRemoveTerminalZone(terminalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zoneId: string) =>
      posTerminalZonesService.remove(terminalId, zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.list(terminalId) });
      toast.success('Zona desvinculada do terminal.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Erro ao desvincular zona.';
      toast.error(message);
    },
  });
}
