import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentConfigService } from '@/services/sales';
import type {
  CreateChargeRequest,
  SavePaymentConfigRequest,
} from '@/types/sales';
import { toast } from 'sonner';
import { useCallback, useEffect, useRef, useState } from 'react';

// =============================================================================
// QUERY KEYS
// =============================================================================

const PAYMENT_CONFIG_KEYS = {
  config: ['payment-config'] as const,
  providers: ['payment-config-providers'] as const,
  charge: (id: string) => ['payment-charge', id] as const,
};

// =============================================================================
// QUERIES
// =============================================================================

export function usePaymentConfig() {
  return useQuery({
    queryKey: PAYMENT_CONFIG_KEYS.config,
    queryFn: async () => {
      const response = await paymentConfigService.getConfig();
      return response;
    },
  });
}

export function useProviders() {
  return useQuery({
    queryKey: PAYMENT_CONFIG_KEYS.providers,
    queryFn: async () => {
      const response = await paymentConfigService.getProviders();
      return response;
    },
  });
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useSavePaymentConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SavePaymentConfigRequest) =>
      paymentConfigService.saveConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PAYMENT_CONFIG_KEYS.config,
      });
      toast.success('Configuração salva com sucesso.');
    },
    onError: () => {
      toast.error('Erro ao salvar configuração.');
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (provider: 'primary' | 'fallback') =>
      paymentConfigService.testConnection(provider),
  });
}

export function useCreateCharge() {
  return useMutation({
    mutationFn: (data: CreateChargeRequest) =>
      paymentConfigService.createCharge(data),
    onError: () => {
      toast.error('Erro ao criar cobrança.');
    },
  });
}

// =============================================================================
// CHARGE STATUS WITH EXPONENTIAL BACKOFF POLLING
// =============================================================================

const BACKOFF_INTERVALS = [3000, 5000, 10000, 30000, 60000];

export function useChargeStatus(chargeId: string | null) {
  const [pollIndex, setPollIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: PAYMENT_CONFIG_KEYS.charge(chargeId ?? ''),
    queryFn: async () => {
      const response = await paymentConfigService.checkChargeStatus(chargeId!);
      return response;
    },
    enabled: !!chargeId,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const scheduleNext = useCallback(() => {
    if (!chargeId) return;
    if (query.data?.status && query.data.status !== 'PENDING') return;

    const interval =
      BACKOFF_INTERVALS[Math.min(pollIndex, BACKOFF_INTERVALS.length - 1)];

    intervalRef.current = setTimeout(() => {
      query.refetch().then(() => {
        setPollIndex((prev) => prev + 1);
      });
    }, interval);
  }, [chargeId, pollIndex, query]);

  useEffect(() => {
    if (!chargeId) return;
    if (query.data?.status && query.data.status !== 'PENDING') return;
    if (query.isLoading) return;

    scheduleNext();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [chargeId, query.data?.status, query.isLoading, scheduleNext]);

  // Reset poll index when chargeId changes
  useEffect(() => {
    setPollIndex(0);
  }, [chargeId]);

  return query;
}
