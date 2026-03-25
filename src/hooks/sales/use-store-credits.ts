import { storeCreditsService } from '@/services/sales';
import type {
  CreateStoreCreditRequest,
  StoreCreditSource,
  StoreCreditsQuery,
} from '@/types/sales';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export interface StoreCreditsFilters {
  search?: string;
  source?: StoreCreditSource;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const QUERY_KEYS = {
  STORE_CREDITS: ['store-credits'],
  STORE_CREDIT: (id: string) => ['store-credits', id],
  STORE_CREDITS_INFINITE: (filters?: StoreCreditsFilters) => [
    'store-credits',
    'infinite',
    filters,
  ],
} as const;

const PAGE_SIZE = 20;

export function useStoreCreditsInfinite(filters?: StoreCreditsFilters) {
  const result = useInfiniteQuery({
    queryKey: QUERY_KEYS.STORE_CREDITS_INFINITE(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await storeCreditsService.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: filters?.search || undefined,
        source: filters?.source || undefined,
        isActive: filters?.isActive || undefined,
        sortBy: filters?.sortBy || undefined,
        sortOrder: filters?.sortOrder || undefined,
      } as StoreCreditsQuery);
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

  const storeCredits = result.data?.pages.flatMap(p => p.storeCredits) ?? [];
  const total = result.data?.pages[0]?.meta.total ?? 0;

  return { ...result, storeCredits, total };
}

export function useStoreCredit(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.STORE_CREDIT(id),
    queryFn: () => storeCreditsService.get(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateStoreCredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoreCreditRequest) =>
      storeCreditsService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['store-credits'] });
    },
  });
}

export function useDeleteStoreCredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storeCreditsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['store-credits'] });
    },
  });
}
