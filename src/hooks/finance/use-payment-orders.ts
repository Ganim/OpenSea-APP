import {
  paymentOrdersService,
  type CreatePaymentOrderData,
} from '@/services/finance';
import {
  useMutation,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const QUERY_KEYS = {
  PAYMENT_ORDERS: ['payment-orders'],
  PAYMENT_ORDER: (id: string) => ['payment-orders', id],
} as const;

export { QUERY_KEYS as paymentOrderKeys };

// =============================================================================
// QUERY HOOKS
// =============================================================================

export function usePaymentOrders(params?: { status?: string; limit?: number }) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.PAYMENT_ORDERS, params],
    queryFn: async ({ pageParam = 1 }) => {
      return paymentOrdersService.list({
        ...params,
        page: pageParam,
        limit: params?.limit ?? 20,
      });
    },
    getNextPageParam: lastPage => {
      if (lastPage.meta.page < lastPage.meta.pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function usePaymentOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENT_ORDER(id),
    queryFn: () => paymentOrdersService.get(id),
    enabled: !!id,
  });
}

// =============================================================================
// MUTATION HOOKS
// =============================================================================

export function useCreatePaymentOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentOrderData) =>
      paymentOrdersService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PAYMENT_ORDERS,
      });
    },
  });
}

export function useApprovePaymentOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentOrdersService.approve(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PAYMENT_ORDERS,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PAYMENT_ORDER(id),
      });
    },
  });
}

export function useRejectPaymentOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      paymentOrdersService.reject(id, reason),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PAYMENT_ORDERS,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PAYMENT_ORDER(variables.id),
      });
    },
  });
}
