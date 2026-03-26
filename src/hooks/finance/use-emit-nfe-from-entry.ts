import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeEntriesService } from '@/services/finance';
import type {
  EmitNfeFromEntryData,
  EmitNfeFromEntryResponse,
} from '@/types/finance';

export function useEmitNfeFromEntry() {
  const queryClient = useQueryClient();

  return useMutation<
    EmitNfeFromEntryResponse,
    Error,
    { entryId: string; data: EmitNfeFromEntryData }
  >({
    mutationFn: ({ entryId, data }) =>
      financeEntriesService.emitNfeFromEntry(entryId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['finance-entries', variables.entryId],
      });
      queryClient.invalidateQueries({
        queryKey: ['finance-entries'],
      });
      queryClient.invalidateQueries({
        queryKey: ['fiscal', 'documents'],
      });
    },
  });
}
