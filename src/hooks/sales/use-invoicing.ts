import { invoicingService } from '@/services/sales';
import type {
  CancelInvoiceRequest,
  ConfigureFocusNfeRequest,
  InvoiceStatus,
  IssueInvoiceRequest,
  ListInvoicesQuery,
} from '@/types/sales';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export type InvoicesFilters = Omit<ListInvoicesQuery, 'page' | 'limit'>;

export const INVOICING_KEYS = {
  all: ['invoicing'] as const,
  list: (params?: InvoicesFilters) => ['invoicing', 'list', params] as const,
  detail: (invoiceId: string) => ['invoicing', 'detail', invoiceId] as const,
} as const;

export function useInvoices(params?: ListInvoicesQuery) {
  return useQuery({
    queryKey: INVOICING_KEYS.list(params),
    queryFn: () => invoicingService.listInvoices(params),
  });
}

export function useInvoicesInfinite(filters?: InvoicesFilters, limit = 20) {
  return useInfiniteQuery({
    queryKey: INVOICING_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await invoicingService.listInvoices({
        ...filters,
        page: pageParam,
        limit,
      });
    },
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useInvoice(invoiceId: string | null) {
  return useQuery({
    queryKey: INVOICING_KEYS.detail(invoiceId ?? ''),
    queryFn: () => invoicingService.getInvoice(invoiceId!),
    enabled: !!invoiceId,
  });
}

export function useIssueInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data?: IssueInvoiceRequest;
    }) => invoicingService.issueInvoice(orderId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: INVOICING_KEYS.all });
      toast.success('Emissão fiscal iniciada com sucesso.');
    },
    onError: () => {
      toast.error('Nao foi possivel emitir a nota fiscal.');
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      data,
    }: {
      invoiceId: string;
      data: CancelInvoiceRequest;
    }) => invoicingService.cancelInvoice(invoiceId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: INVOICING_KEYS.all });
      toast.success('Nota fiscal cancelada com sucesso.');
    },
    onError: () => {
      toast.error('Erro ao cancelar a nota fiscal.');
    },
  });
}

export function useConfigureFocusNfe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfigureFocusNfeRequest) =>
      invoicingService.configureFocusNfe(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: INVOICING_KEYS.all });
      toast.success('Configuração Focus NFe salva.');
    },
    onError: () => {
      toast.error('Falha ao salvar configuração Focus NFe.');
    },
  });
}

export function invoiceStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pendente';
    case 'ISSUED':
      return 'Emitida';
    case 'CANCELLED':
      return 'Cancelada';
    case 'ERROR':
      return 'Erro';
    default:
      return status;
  }
}
