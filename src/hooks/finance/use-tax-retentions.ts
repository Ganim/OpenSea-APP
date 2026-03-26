import { taxRetentionService } from '@/services/finance';
import type { RetentionConfig } from '@/types/finance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// QUERY KEYS
// ============================================================================

const RETENTION_KEYS = {
  ENTRY_RETENTIONS: (entryId: string) => ['finance-entry-retentions', entryId],
} as const;

// ============================================================================
// QUERIES
// ============================================================================

export function useEntryRetentions(entryId: string) {
  return useQuery({
    queryKey: RETENTION_KEYS.ENTRY_RETENTIONS(entryId),
    queryFn: () => taxRetentionService.list(entryId),
    enabled: !!entryId,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useCalculateRetentions() {
  return useMutation({
    mutationFn: ({
      entryId,
      config,
    }: {
      entryId: string;
      config: RetentionConfig;
    }) => taxRetentionService.calculate(entryId, config),
  });
}

export function useApplyRetentions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      config,
    }: {
      entryId: string;
      config: RetentionConfig;
    }) => taxRetentionService.apply(entryId, config),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: RETENTION_KEYS.ENTRY_RETENTIONS(variables.entryId),
      });
      // Also invalidate the entry itself since retentions affect it
      queryClient.invalidateQueries({
        queryKey: ['finance-entries', variables.entryId],
      });
    },
  });
}
