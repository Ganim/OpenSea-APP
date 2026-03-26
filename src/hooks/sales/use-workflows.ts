import { workflowsService } from '@/services/sales';
import type { WorkflowsQuery } from '@/services/sales/workflows.service';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type WorkflowsFilters = Omit<WorkflowsQuery, 'page' | 'limit'>;

const WORKFLOW_KEYS = {
  all: ['workflows'] as const,
  list: (filters?: WorkflowsFilters) => ['workflows', 'list', filters] as const,
  detail: (id: string) => ['workflows', 'detail', id] as const,
} as const;

export function useWorkflowsInfinite(filters?: WorkflowsFilters, limit = 20) {
  return useInfiniteQuery({
    queryKey: WORKFLOW_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await workflowsService.list({
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

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: WORKFLOW_KEYS.detail(id),
    queryFn: () => workflowsService.get(id),
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      workflowsService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORKFLOW_KEYS.all });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      workflowsService.update(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: WORKFLOW_KEYS.all });
      await queryClient.invalidateQueries({
        queryKey: WORKFLOW_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORKFLOW_KEYS.all });
    },
  });
}

export function useActivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowsService.activate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORKFLOW_KEYS.all });
    },
  });
}

export function useDeactivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowsService.deactivate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORKFLOW_KEYS.all });
    },
  });
}

export function useExecuteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: Record<string, unknown>;
    }) => workflowsService.execute(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORKFLOW_KEYS.all });
    },
  });
}
