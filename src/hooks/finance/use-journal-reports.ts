import { journalEntriesService } from '@/services/finance';
import { useQuery } from '@tanstack/react-query';

const QUERY_KEYS = {
  LEDGER: (params: { chartOfAccountId: string; from: string; to: string }) => [
    'finance-ledger',
    params,
  ],
  TRIAL_BALANCE: (params: { from: string; to: string }) => [
    'finance-trial-balance',
    params,
  ],
} as const;

export function useLedger(params: {
  chartOfAccountId: string;
  from: string;
  to: string;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.LEDGER(params),
    queryFn: () => journalEntriesService.getLedger(params),
    enabled: !!params.chartOfAccountId && !!params.from && !!params.to,
  });
}

export function useTrialBalance(params: { from: string; to: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.TRIAL_BALANCE(params),
    queryFn: () => journalEntriesService.getTrialBalance(params),
    enabled: !!params.from && !!params.to,
  });
}
