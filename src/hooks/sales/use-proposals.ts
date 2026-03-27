import { proposalsService } from '@/services/sales';
import type { ProposalsQuery } from '@/services/sales/proposals.service';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type ProposalsFilters = Omit<ProposalsQuery, 'page' | 'limit'>;

const PROPOSAL_KEYS = {
  all: ['proposals'] as const,
  list: (filters?: ProposalsFilters) => ['proposals', 'list', filters] as const,
  detail: (id: string) => ['proposals', 'detail', id] as const,
  signatureStatus: (id: string) =>
    ['proposals', 'signature-status', id] as const,
} as const;

export function useProposalsInfinite(filters?: ProposalsFilters, limit = 20) {
  return useInfiniteQuery({
    queryKey: PROPOSAL_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await proposalsService.list({
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

export function useProposal(id: string) {
  return useQuery({
    queryKey: PROPOSAL_KEYS.detail(id),
    queryFn: () => proposalsService.get(id),
    enabled: !!id,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      proposalsService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      proposalsService.update(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
      await queryClient.invalidateQueries({
        queryKey: PROPOSAL_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => proposalsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    },
  });
}

export function useSendProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => proposalsService.send(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    },
  });
}

export function useApproveProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => proposalsService.approve(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    },
  });
}

export function useRejectProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: Record<string, unknown>;
    }) => proposalsService.reject(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    },
  });
}

export function useDuplicateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => proposalsService.duplicate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    },
  });
}

export function useRequestProposalSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: { signerEmail?: string; signerName?: string };
    }) => proposalsService.requestSignature(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: PROPOSAL_KEYS.detail(variables.id),
      });
      await queryClient.invalidateQueries({
        queryKey: PROPOSAL_KEYS.signatureStatus(variables.id),
      });
    },
  });
}

export function useProposalSignatureStatus(proposalId: string) {
  return useQuery({
    queryKey: PROPOSAL_KEYS.signatureStatus(proposalId),
    queryFn: () => proposalsService.getSignatureStatus(proposalId),
    enabled: !!proposalId,
  });
}
