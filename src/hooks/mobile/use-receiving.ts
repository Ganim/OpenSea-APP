import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { purchaseOrdersService } from '@/services/stock/purchase-orders.service';
import { itemsService } from '@/services/stock/items.service';
import { scanSuccess, scanError } from '@/lib/scan-feedback';
import type {
  PurchaseOrder,
  PurchaseOrderStatus,
  RegisterItemEntryRequest,
} from '@/types/stock';

// ─── Query keys ─────────────────────────────────────────────────────
const RECEIVING_KEYS = {
  pendingOrders: ['purchase-orders', 'pending'] as const,
  order: (id: string) => ['purchase-orders', id] as const,
};

// ─── usePendingPurchaseOrders ───────────────────────────────────────
// Lists POs with status PENDING or CONFIRMED (ready to receive)
export function usePendingPurchaseOrders(search?: string) {
  return useQuery({
    queryKey: [...RECEIVING_KEYS.pendingOrders, search],
    queryFn: async () => {
      // Fetch PENDING orders
      const [pendingRes, confirmedRes] = await Promise.all([
        purchaseOrdersService.list({
          status: 'PENDING' as PurchaseOrderStatus,
          search,
          limit: 50,
          sortBy: 'expectedDate',
          sortOrder: 'asc',
        }),
        purchaseOrdersService.list({
          status: 'CONFIRMED' as PurchaseOrderStatus,
          search,
          limit: 50,
          sortBy: 'expectedDate',
          sortOrder: 'asc',
        }),
      ]);

      const all = [
        ...pendingRes.purchaseOrders,
        ...confirmedRes.purchaseOrders,
      ];

      // Sort by expectedDate (soonest first), nulls last
      all.sort((a, b) => {
        if (!a.expectedDate && !b.expectedDate) return 0;
        if (!a.expectedDate) return 1;
        if (!b.expectedDate) return -1;
        return (
          new Date(a.expectedDate).getTime() -
          new Date(b.expectedDate).getTime()
        );
      });

      return all;
    },
    staleTime: 30_000,
  });
}

// ─── usePurchaseOrder ───────────────────────────────────────────────
export function usePurchaseOrder(orderId: string) {
  return useQuery({
    queryKey: RECEIVING_KEYS.order(orderId),
    queryFn: async () => {
      const res = await purchaseOrdersService.get(orderId);
      return res.purchaseOrder;
    },
    enabled: !!orderId,
  });
}

// ─── useReceiveItem ─────────────────────────────────────────────────
// Mutation: register item entry for a PO item
interface ReceiveItemParams {
  variantId: string;
  binId: string;
  quantity: number;
  purchaseOrderId: string;
  unitCost?: number;
  notes?: string;
}

export function useReceiveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ReceiveItemParams) => {
      const entryData: RegisterItemEntryRequest = {
        variantId: params.variantId,
        binId: params.binId,
        quantity: params.quantity,
        movementType: 'PURCHASE',
        unitCost: params.unitCost,
        notes: params.notes,
      };

      return itemsService.registerEntry(entryData);
    },
    onSuccess: (_data, variables) => {
      scanSuccess();
      // Invalidate the PO and pending list
      queryClient.invalidateQueries({
        queryKey: RECEIVING_KEYS.order(variables.purchaseOrderId),
      });
      queryClient.invalidateQueries({
        queryKey: RECEIVING_KEYS.pendingOrders,
      });
    },
    onError: () => {
      scanError();
    },
  });
}

// ─── useRecentBins ──────────────────────────────────────────────────
// Track last 5 bins used (localStorage)
const RECENT_BINS_KEY = 'recent-bins';
const MAX_RECENT_BINS = 5;

export interface RecentBin {
  id: string;
  address: string;
  usedAt: string;
}

function loadRecentBins(): RecentBin[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_BINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_BINS) : [];
  } catch {
    return [];
  }
}

function saveRecentBins(bins: RecentBin[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      RECENT_BINS_KEY,
      JSON.stringify(bins.slice(0, MAX_RECENT_BINS))
    );
  } catch {
    // Storage full or unavailable
  }
}

export function useRecentBins() {
  const [bins, setBins] = useState<RecentBin[]>([]);

  // Load on mount
  useEffect(() => {
    setBins(loadRecentBins());
  }, []);

  const addBin = useCallback((id: string, address: string) => {
    setBins(prev => {
      const filtered = prev.filter(b => b.id !== id);
      const updated: RecentBin[] = [
        { id, address, usedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_RECENT_BINS);
      saveRecentBins(updated);
      return updated;
    });
  }, []);

  const clearBins = useCallback(() => {
    setBins([]);
    saveRecentBins([]);
  }, []);

  return { bins, addBin, clearBins };
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Calculate receiving progress for a PO */
export function getReceivingProgress(order: PurchaseOrder) {
  const totalExpected = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalReceived = order.items.reduce(
    (sum, i) => sum + (i.receivedQuantity ?? 0),
    0
  );
  const percentage =
    totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0;

  return { totalExpected, totalReceived, percentage };
}

/** Check if PO is overdue */
export function isOrderOverdue(expectedDate?: string | null): boolean {
  if (!expectedDate) return false;
  const expected = new Date(expectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expected.setHours(0, 0, 0, 0);
  return expected < today;
}

/** Check if PO is expected today */
export function isOrderToday(expectedDate?: string | null): boolean {
  if (!expectedDate) return false;
  const expected = new Date(expectedDate);
  const today = new Date();
  return expected.toDateString() === today.toDateString();
}
