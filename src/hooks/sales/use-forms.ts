import { formsService } from '@/services/sales';
import type { FormsQuery } from '@/services/sales/forms.service';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type FormsFilters = Omit<FormsQuery, 'page' | 'limit'>;

const FORM_KEYS = {
  all: ['forms'] as const,
  list: (filters?: FormsFilters) => ['forms', 'list', filters] as const,
  detail: (id: string) => ['forms', 'detail', id] as const,
  submissions: (formId: string) => ['forms', 'submissions', formId] as const,
} as const;

/** Simple paginated list (page 1, large limit) for dropdowns */
export function useForms(filters?: FormsFilters) {
  return useQuery({
    queryKey: [...FORM_KEYS.all, 'simple', filters],
    queryFn: () =>
      formsService.list({
        ...filters,
        page: 1,
        limit: 100,
      }),
    staleTime: 60_000,
  });
}

export function useFormsInfinite(filters?: FormsFilters, limit = 20) {
  return useInfiniteQuery({
    queryKey: FORM_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await formsService.list({
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

export function useForm(id: string) {
  return useQuery({
    queryKey: FORM_KEYS.detail(id),
    queryFn: () => formsService.get(id),
    enabled: !!id,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => formsService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FORM_KEYS.all });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      formsService.update(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: FORM_KEYS.all });
      await queryClient.invalidateQueries({
        queryKey: FORM_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FORM_KEYS.all });
    },
  });
}

export function usePublishForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formsService.publish(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FORM_KEYS.all });
    },
  });
}

export function useUnpublishForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formsService.unpublish(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FORM_KEYS.all });
    },
  });
}

export function useDuplicateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formsService.duplicate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FORM_KEYS.all });
    },
  });
}

export function useFormSubmissions(
  formId: string,
  params?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: [...FORM_KEYS.submissions(formId), params],
    queryFn: () => formsService.listSubmissions(formId, params),
    enabled: !!formId,
  });
}

export function useSubmitForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      formId,
      data,
    }: {
      formId: string;
      data: Record<string, unknown>;
    }) => formsService.submitForm(formId, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: FORM_KEYS.submissions(variables.formId),
      });
    },
  });
}
