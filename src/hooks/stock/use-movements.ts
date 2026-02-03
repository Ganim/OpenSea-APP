import { movementsService } from '@/services/stock';
import type { MovementHistoryQuery, BatchApprovalRequest } from '@/types/stock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const MOVEMENT_QUERY_KEYS = {
  MOVEMENTS: ['movements'],
  HISTORY: ['movements', 'history'],
  PRODUCT_MOVEMENTS: (productId: string) => ['movements', 'product', productId],
  VARIANT_MOVEMENTS: (variantId: string) => ['movements', 'variant', variantId],
  BIN_MOVEMENTS: (binId: string) => ['movements', 'bin', binId],
  PENDING_APPROVALS: ['movements', 'pending-approvals'],
} as const;

// GET /v1/item-movements - Lista movimentações
export function useMovements(query?: MovementHistoryQuery) {
  return useQuery({
    queryKey: [...MOVEMENT_QUERY_KEYS.MOVEMENTS, query],
    queryFn: () => movementsService.listMovements(query),
  });
}

// GET /v1/movements/history - Histórico de movimentações
export function useMovementHistory(query?: MovementHistoryQuery) {
  return useQuery({
    queryKey: [...MOVEMENT_QUERY_KEYS.HISTORY, query],
    queryFn: () => movementsService.getHistory(query),
  });
}

// GET /v1/products/:productId/movements - Movimentações de um produto
export function useProductMovements(
  productId: string,
  query?: MovementHistoryQuery
) {
  return useQuery({
    queryKey: [...MOVEMENT_QUERY_KEYS.PRODUCT_MOVEMENTS(productId), query],
    queryFn: () => movementsService.getProductMovements(productId, query),
    enabled: !!productId,
  });
}

// GET /v1/variants/:variantId/movements - Movimentações de uma variante
export function useVariantMovements(
  variantId: string,
  query?: MovementHistoryQuery
) {
  return useQuery({
    queryKey: [...MOVEMENT_QUERY_KEYS.VARIANT_MOVEMENTS(variantId), query],
    queryFn: () => movementsService.getVariantMovements(variantId, query),
    enabled: !!variantId,
  });
}

// GET /v1/bins/:binId/movements - Movimentações de um bin
export function useBinMovements(binId: string, query?: MovementHistoryQuery) {
  return useQuery({
    queryKey: [...MOVEMENT_QUERY_KEYS.BIN_MOVEMENTS(binId), query],
    queryFn: () => movementsService.getBinMovements(binId, query),
    enabled: !!binId,
  });
}

// GET /v1/movements/pending-approval - Movimentações pendentes de aprovação
export function usePendingApprovals() {
  return useQuery({
    queryKey: MOVEMENT_QUERY_KEYS.PENDING_APPROVALS,
    queryFn: () => movementsService.getPendingApprovals(),
    // Refresh every 30 seconds to keep approvals up to date
    refetchInterval: 30000,
  });
}

// POST /v1/movements/:id/approve - Aprova uma movimentação
export function useApproveMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      movementsService.approveMovement(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MOVEMENT_QUERY_KEYS.MOVEMENTS,
      });
      queryClient.invalidateQueries({
        queryKey: MOVEMENT_QUERY_KEYS.PENDING_APPROVALS,
      });
      // Items quantity may have changed
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
  });
}

// POST /v1/movements/:id/reject - Rejeita uma movimentação
export function useRejectMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      movementsService.rejectMovement(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MOVEMENT_QUERY_KEYS.MOVEMENTS,
      });
      queryClient.invalidateQueries({
        queryKey: MOVEMENT_QUERY_KEYS.PENDING_APPROVALS,
      });
    },
  });
}

// POST /v1/movements/approve/batch - Aprova várias movimentações
export function useBatchApproveMovements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchApprovalRequest) =>
      movementsService.approveBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MOVEMENT_QUERY_KEYS.MOVEMENTS,
      });
      queryClient.invalidateQueries({
        queryKey: MOVEMENT_QUERY_KEYS.PENDING_APPROVALS,
      });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
  });
}
