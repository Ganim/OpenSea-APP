import { discountRulesService } from '@/services/sales';
import type { DiscountRulesQuery } from '@/services/sales/discount-rules.service';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type DiscountRulesFilters = Omit<DiscountRulesQuery, 'page' | 'limit'>;

const DISCOUNT_RULE_KEYS = {
  all: ['discount-rules'] as const,
  list: (filters?: DiscountRulesFilters) =>
    ['discount-rules', 'list', filters] as const,
  detail: (id: string) => ['discount-rules', 'detail', id] as const,
} as const;

export function useDiscountRulesInfinite(
  filters?: DiscountRulesFilters,
  limit = 20
) {
  return useInfiniteQuery({
    queryKey: DISCOUNT_RULE_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await discountRulesService.list({
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

export function useDiscountRule(id: string) {
  return useQuery({
    queryKey: DISCOUNT_RULE_KEYS.detail(id),
    queryFn: () => discountRulesService.get(id),
    enabled: !!id,
  });
}

export function useCreateDiscountRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      discountRulesService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DISCOUNT_RULE_KEYS.all,
      });
    },
  });
}

export function useUpdateDiscountRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      discountRulesService.update(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: DISCOUNT_RULE_KEYS.all,
      });
      await queryClient.invalidateQueries({
        queryKey: DISCOUNT_RULE_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteDiscountRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountRulesService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DISCOUNT_RULE_KEYS.all,
      });
    },
  });
}
