import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { cashierService } from '@/services/cashier';
import type { CreatePixChargeRequest, PixChargeStatus } from '@/types/cashier';
import { toast } from 'sonner';

export interface PixChargesFilters {
  search?: string;
  status?: PixChargeStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const PIX_KEYS = {
  CHARGES: ['pix-charges'],
  CHARGES_INFINITE: (filters?: PixChargesFilters) => [
    'pix-charges',
    'infinite',
    filters,
  ],
} as const;

const PAGE_SIZE = 20;

export function usePixCharges(filters?: PixChargesFilters) {
  const result = useInfiniteQuery({
    queryKey: PIX_KEYS.CHARGES_INFINITE(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await cashierService.listPixCharges({
        page: pageParam,
        limit: PAGE_SIZE,
        search: filters?.search || undefined,
        status: filters?.status || undefined,
        sortBy: filters?.sortBy || undefined,
        sortOrder: filters?.sortOrder || undefined,
      });
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

  const charges = result.data?.pages.flatMap(p => p.charges) ?? [];
  const total = result.data?.pages[0]?.meta.total ?? 0;

  return { ...result, charges, total };
}

export function useCreatePixCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePixChargeRequest) =>
      cashierService.createPixCharge(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PIX_KEYS.CHARGES });
      toast.success('Cobranca PIX criada com sucesso.');
    },
    onError: () => {
      toast.error('Erro ao criar cobranca PIX.');
    },
  });
}
