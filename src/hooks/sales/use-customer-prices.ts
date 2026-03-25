import { customerPricesService } from '@/services/sales';
import type {
  CreateCustomerPriceRequest,
  CustomerPricesQuery,
  UpdateCustomerPriceRequest,
} from '@/types/sales';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

export interface CustomerPricesFilters {
  customerId?: string;
  variantId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const QUERY_KEYS = {
  CUSTOMER_PRICES: ['customer-prices'],
  CUSTOMER_PRICES_INFINITE: (filters?: CustomerPricesFilters) => [
    'customer-prices',
    'infinite',
    filters,
  ],
} as const;

const PAGE_SIZE = 20;

export function useCustomerPricesInfinite(filters?: CustomerPricesFilters) {
  const result = useInfiniteQuery({
    queryKey: QUERY_KEYS.CUSTOMER_PRICES_INFINITE(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await customerPricesService.list({
        page: pageParam,
        limit: PAGE_SIZE,
        customerId: filters?.customerId || undefined,
        variantId: filters?.variantId || undefined,
        sortBy: filters?.sortBy || undefined,
        sortOrder: filters?.sortOrder || undefined,
      } as CustomerPricesQuery);
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.meta.page < lastPage.meta.pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 30_000,
  });

  const customerPrices =
    result.data?.pages.flatMap(p => p.customerPrices) ?? [];
  const total = result.data?.pages[0]?.meta.total ?? 0;

  return { ...result, customerPrices, total };
}

export function useCreateCustomerPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerPriceRequest) =>
      customerPricesService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['customer-prices'],
      });
    },
  });
}

export function useUpdateCustomerPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCustomerPriceRequest;
    }) => customerPricesService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['customer-prices'],
      });
    },
  });
}

export function useDeleteCustomerPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerPricesService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['customer-prices'],
      });
    },
  });
}
