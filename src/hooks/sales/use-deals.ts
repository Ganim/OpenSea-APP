import { dealsService } from '@/services/sales';
import type {
  ChangeDealStageRequest,
  CreateDealRequest,
  DealStatus,
  DealsQuery,
  UpdateDealRequest,
} from '@/types/sales';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export interface DealsFilters {
  search?: string;
  pipelineId?: string;
  stageId?: string;
  status?: DealStatus;
  customerId?: string;
  assignedToUserId?: string;
  minValue?: number;
  maxValue?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const QUERY_KEYS = {
  DEALS: ['deals'],
  DEALS_INFINITE: (filters?: DealsFilters) => ['deals', 'infinite', filters],
  DEAL: (id: string) => ['deals', id],
} as const;

const PAGE_SIZE = 20;

// GET /v1/deals - Infinite scroll com filtros e sorting server-side
export function useDealsInfinite(filters?: DealsFilters) {
  const result = useInfiniteQuery({
    queryKey: QUERY_KEYS.DEALS_INFINITE(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await dealsService.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: filters?.search || undefined,
        pipelineId: filters?.pipelineId || undefined,
        stageId: filters?.stageId || undefined,
        status: filters?.status || undefined,
        customerId: filters?.customerId || undefined,
        assignedToUserId: filters?.assignedToUserId || undefined,
        minValue: filters?.minValue,
        maxValue: filters?.maxValue,
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

  const deals = result.data?.pages.flatMap(p => p.deals) ?? [];
  const total = result.data?.pages[0]?.meta.total ?? 0;

  return {
    ...result,
    deals,
    total,
  };
}

// GET /v1/deals/:dealId - Busca um deal especifico
export function useDeal(dealId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DEAL(dealId),
    queryFn: () => dealsService.get(dealId),
    enabled: !!dealId,
  });
}

// POST /v1/deals - Cria um novo deal
export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDealRequest) => dealsService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

// PUT /v1/deals/:dealId - Atualiza um deal
export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dealId,
      data,
    }: {
      dealId: string;
      data: UpdateDealRequest;
    }) => dealsService.update(dealId, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DEAL(variables.dealId),
      });
    },
  });
}

// DELETE /v1/deals/:dealId - Deleta um deal
export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dealId: string) => dealsService.delete(dealId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

// PUT /v1/deals/:dealId/stage - Altera o stage de um deal
export function useChangeDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dealId,
      data,
    }: {
      dealId: string;
      data: ChangeDealStageRequest;
    }) => dealsService.changeStage(dealId, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DEAL(variables.dealId),
      });
    },
  });
}
