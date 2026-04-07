import { journalEntriesService } from '@/services/finance';
import type {
  CreateJournalEntryData,
  JournalEntriesQuery,
} from '@/types/finance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
  JOURNAL_ENTRIES: ['journal-entries'],
  JOURNAL_ENTRY: (id: string) => ['journal-entries', id],
  LEDGER: (params: { chartOfAccountId: string; from: string; to: string }) => [
    'ledger',
    params,
  ],
  TRIAL_BALANCE: (params: { from: string; to: string }) => [
    'trial-balance',
    params,
  ],
} as const;

export function useJournalEntries(params?: JournalEntriesQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.JOURNAL_ENTRIES, params],
    queryFn: () => journalEntriesService.list(params),
  });
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.JOURNAL_ENTRY(id),
    queryFn: () => journalEntriesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalEntryData) =>
      journalEntriesService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.JOURNAL_ENTRIES,
      });
    },
  });
}

export function useReverseJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalEntriesService.reverse(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.JOURNAL_ENTRIES,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.JOURNAL_ENTRY(id),
      });
    },
  });
}
