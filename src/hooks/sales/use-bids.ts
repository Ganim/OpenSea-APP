import { bidsService } from '@/services/sales/bids.service';
import type {
  Bid,
  BidsQuery,
  CreateBidRequest,
  UpdateBidRequest,
} from '@/types/sales';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const BIDS_KEY = 'bids';
const BID_KEY = 'bid';

export function useBidsInfinite(query?: Omit<BidsQuery, 'page'>) {
  return useInfiniteQuery({
    queryKey: [BIDS_KEY, query],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await bidsService.list({
        ...query,
        page: pageParam,
        limit: query?.limit ?? 20,
      });
      return response;
    },
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useBid(id: string | undefined) {
  return useQuery({
    queryKey: [BID_KEY, id],
    queryFn: async () => {
      const response = await bidsService.get(id!);
      return response.bid;
    },
    enabled: !!id,
  });
}

export function useCreateBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBidRequest) => bidsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BIDS_KEY] });
    },
  });
}

export function useUpdateBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBidRequest }) =>
      bidsService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [BIDS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BID_KEY, variables.id] });
    },
  });
}

export function useDeleteBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bidsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BIDS_KEY] });
    },
  });
}

export function useBidItems(bidId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['bid-items', bidId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await bidsService.listItems(bidId!, {
        page: pageParam,
        limit: 50,
      });
      return response;
    },
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!bidId,
  });
}

export function useBidHistory(bidId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['bid-history', bidId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await bidsService.listHistory(bidId!, {
        page: pageParam,
        limit: 20,
      });
      return response;
    },
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!bidId,
  });
}

export function useBidDocuments(query?: { bidId?: string; type?: string }) {
  return useInfiniteQuery({
    queryKey: ['bid-documents', query],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await bidsService.listDocuments({
        ...query,
        page: pageParam,
        limit: 20,
      });
      return response;
    },
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useBidContracts(query?: { status?: string; bidId?: string }) {
  return useInfiniteQuery({
    queryKey: ['bid-contracts', query],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await bidsService.listContracts({
        ...query,
        page: pageParam,
        limit: 20,
      });
      return response;
    },
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
  });
}
