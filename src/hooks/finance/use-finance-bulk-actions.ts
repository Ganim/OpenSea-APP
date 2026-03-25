import { financeEntriesService } from '@/services/finance';
import type {
  BulkPayData,
  BulkCancelData,
  BulkDeleteData,
  BulkCategorizeData,
} from '@/types/finance';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// QUERY KEY (same as use-finance-entries)
// ============================================================================

const FINANCE_ENTRIES_KEY = ['finance-entries'];

// ============================================================================
// BULK PAY
// ============================================================================

export function useBulkPayEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkPayData) => financeEntriesService.bulkPay(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: FINANCE_ENTRIES_KEY,
      });
    },
  });
}

// ============================================================================
// BULK CANCEL
// ============================================================================

export function useBulkCancelEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkCancelData) =>
      financeEntriesService.bulkCancel(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: FINANCE_ENTRIES_KEY,
      });
    },
  });
}

// ============================================================================
// BULK DELETE
// ============================================================================

export function useBulkDeleteEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkDeleteData) =>
      financeEntriesService.bulkDelete(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: FINANCE_ENTRIES_KEY,
      });
    },
  });
}

// ============================================================================
// BULK CATEGORIZE
// ============================================================================

export function useBulkCategorizeEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkCategorizeData) =>
      financeEntriesService.bulkCategorize(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: FINANCE_ENTRIES_KEY,
      });
    },
  });
}
