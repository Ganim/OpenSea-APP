import { couponsService } from '@/services/sales';
import type {
  CouponsQuery,
  CouponType,
  CreateCouponRequest,
  ValidateCouponRequest,
} from '@/types/sales';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export interface CouponsFilters {
  search?: string;
  type?: CouponType;
  isActive?: string;
  campaignId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const QUERY_KEYS = {
  COUPONS: ['coupons'],
  COUPON: (id: string) => ['coupons', id],
  COUPONS_INFINITE: (filters?: CouponsFilters) => [
    'coupons',
    'infinite',
    filters,
  ],
} as const;

const PAGE_SIZE = 20;

export function useCouponsInfinite(filters?: CouponsFilters) {
  const result = useInfiniteQuery({
    queryKey: QUERY_KEYS.COUPONS_INFINITE(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await couponsService.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: filters?.search || undefined,
        type: filters?.type || undefined,
        isActive: filters?.isActive || undefined,
        campaignId: filters?.campaignId || undefined,
        sortBy: filters?.sortBy || undefined,
        sortOrder: filters?.sortOrder || undefined,
      } as CouponsQuery);
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

  const coupons = result.data?.pages.flatMap(p => p.coupons) ?? [];
  const total = result.data?.pages[0]?.meta.total ?? 0;

  return { ...result, coupons, total };
}

// GET /v1/coupons/:id - Busca um cupom especifico
export function useCoupon(couponId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COUPON(couponId),
    queryFn: () => couponsService.get(couponId),
    enabled: !!couponId,
    staleTime: 30_000,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponRequest) => couponsService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

// PUT /v1/coupons/:id - Atualiza um cupom
export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      couponId,
      data,
    }: {
      couponId: string;
      data: Partial<CreateCouponRequest>;
    }) => couponsService.update(couponId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (data: ValidateCouponRequest) => couponsService.validate(data),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}
