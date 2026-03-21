import { customersService } from '@/services/sales';
import type {
  CreateCustomerRequest,
  ContactSource,
  CustomerType,
  CustomersQuery,
  UpdateCustomerRequest,
} from '@/types/sales';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export interface CustomersFilters {
  search?: string;
  type?: CustomerType;
  source?: ContactSource;
  isActive?: boolean;
  assignedToUserId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const QUERY_KEYS = {
  CUSTOMERS: ['customers'],
  CUSTOMERS_INFINITE: (filters?: CustomersFilters) => [
    'customers',
    'infinite',
    filters,
  ],
  CUSTOMER: (id: string) => ['customers', id],
} as const;

const PAGE_SIZE = 20;

// GET /v1/customers - Infinite scroll com filtros e sorting server-side
export function useCustomersInfinite(filters?: CustomersFilters) {
  const result = useInfiniteQuery({
    queryKey: QUERY_KEYS.CUSTOMERS_INFINITE(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await customersService.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: filters?.search || undefined,
        type: filters?.type || undefined,
        source: filters?.source || undefined,
        isActive: filters?.isActive,
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

  const customers = result.data?.pages.flatMap(p => p.customers) ?? [];
  const total = result.data?.pages[0]?.meta.total ?? 0;

  return {
    ...result,
    customers,
    total,
  };
}

// GET /v1/customers/:customerId - Busca um cliente especifico
export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMER(customerId),
    queryFn: () => customersService.get(customerId),
    enabled: !!customerId,
  });
}

// POST /v1/customers - Cria um novo cliente
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customersService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// PUT /v1/customers/:customerId - Atualiza um cliente
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: UpdateCustomerRequest;
    }) => customersService.update(customerId, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER(variables.customerId),
      });
    },
  });
}

// DELETE /v1/customers/:customerId - Deleta um cliente
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => customersService.delete(customerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
