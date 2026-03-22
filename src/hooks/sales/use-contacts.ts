import { contactsService } from '@/services/sales';
import type {
  ContactsQuery,
  ContactSource,
  CreateContactRequest,
  LeadTemperature,
  LifecycleStage,
  UpdateContactRequest,
} from '@/types/sales';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export interface ContactsFilters {
  search?: string;
  customerId?: string;
  lifecycleStage?: LifecycleStage;
  leadTemperature?: LeadTemperature;
  source?: ContactSource;
  assignedToUserId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const QUERY_KEYS = {
  CONTACTS: ['contacts'],
  CONTACTS_INFINITE: (filters?: ContactsFilters) => [
    'contacts',
    'infinite',
    filters,
  ],
  CONTACT: (id: string) => ['contacts', id],
} as const;

const PAGE_SIZE = 20;

// GET /v1/contacts - Infinite scroll com filtros e sorting server-side
export function useContactsInfinite(filters?: ContactsFilters) {
  const result = useInfiniteQuery({
    queryKey: QUERY_KEYS.CONTACTS_INFINITE(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await contactsService.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: filters?.search || undefined,
        customerId: filters?.customerId || undefined,
        lifecycleStage: filters?.lifecycleStage || undefined,
        leadTemperature: filters?.leadTemperature || undefined,
        source: filters?.source || undefined,
        assignedToUserId: filters?.assignedToUserId || undefined,
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

  const contacts = result.data?.pages.flatMap(p => p.contacts) ?? [];
  const total = result.data?.pages[0]?.meta.total ?? 0;

  return {
    ...result,
    contacts,
    total,
  };
}

// GET /v1/contacts/:contactId - Busca um contato especifico
export function useContact(contactId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CONTACT(contactId),
    queryFn: () => contactsService.get(contactId),
    enabled: !!contactId,
  });
}

// POST /v1/contacts - Cria um novo contato
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactRequest) => contactsService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// PUT /v1/contacts/:contactId - Atualiza um contato
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      data,
    }: {
      contactId: string;
      data: UpdateContactRequest;
    }) => contactsService.update(contactId, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONTACT(variables.contactId),
      });
    },
  });
}

// DELETE /v1/contacts/:contactId - Deleta um contato
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => contactsService.delete(contactId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
