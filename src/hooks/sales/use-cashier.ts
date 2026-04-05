import { cashierService } from '@/services/sales';
import type {
    CashierSessionsQuery,
    CashierTransactionsQuery,
} from '@/services/sales/cashier.service';
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

export type CashierSessionsFilters = Omit<
  CashierSessionsQuery,
  'page' | 'limit'
>;

export type CashierTransactionsFilters = Omit<
  CashierTransactionsQuery,
  'page' | 'limit'
>;

const CASHIER_KEYS = {
  all: ['cashier'] as const,
  sessions: ['cashier', 'sessions'] as const,
  sessionsList: (filters?: CashierSessionsFilters) =>
    ['cashier', 'sessions', 'list', filters] as const,
  session: (id: string) => ['cashier', 'sessions', 'detail', id] as const,
  sessionReport: (id: string) => ['cashier', 'sessions', 'report', id] as const,
  activeSession: ['cashier', 'sessions', 'active'] as const,
  transactions: ['cashier', 'transactions'] as const,
  transactionsList: (filters?: CashierTransactionsFilters) =>
    ['cashier', 'transactions', 'list', filters] as const,
} as const;

// Sessions
export function useCashierSessionsInfinite(
  filters?: CashierSessionsFilters,
  limit = 20
) {
  return useInfiniteQuery({
    queryKey: CASHIER_KEYS.sessionsList(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await cashierService.listSessions({
        ...filters,
        page: pageParam,
        limit,
      });
    },
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.pages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useCashierSession(id: string) {
  return useQuery({
    queryKey: CASHIER_KEYS.session(id),
    queryFn: () => cashierService.getSession(id),
    enabled: !!id,
  });
}

export function useCashierSessionReport(sessionId: string | null) {
  return useQuery({
    queryKey: CASHIER_KEYS.sessionReport(sessionId ?? ''),
    queryFn: () => cashierService.getSessionReport(sessionId!),
    enabled: !!sessionId,
  });
}

export function useActiveCashierSession() {
  return useQuery({
    queryKey: CASHIER_KEYS.activeSession,
    queryFn: () => cashierService.getActiveSession(),
  });
}

export function useOpenCashierSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      cashierService.openSession(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CASHIER_KEYS.all });
    },
  });
}

export function useCloseCashierSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: Record<string, unknown>;
    }) => cashierService.closeSession(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CASHIER_KEYS.all });
    },
  });
}

// Transactions
export function useCashierTransactionsInfinite(
  filters?: CashierTransactionsFilters,
  limit = 20
) {
  return useInfiniteQuery({
    queryKey: CASHIER_KEYS.transactionsList(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await cashierService.listTransactions({
        ...filters,
        page: pageParam,
        limit,
      });
    },
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.pages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useCreateCashierTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      cashierService.createTransaction(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CASHIER_KEYS.transactions,
      });
    },
  });
}

// Cash Movement
export function useCashierCashMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      cashierService.cashMovement(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CASHIER_KEYS.all });
    },
  });
}

// Reconcile
export function useReconcileCashierSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data?: Record<string, unknown>;
    }) => cashierService.reconcile(sessionId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CASHIER_KEYS.all });
    },
  });
}
