import { printingService } from '@/services/sales';
import type {
    QueueReceiptRequest,
    RegisterPrinterRequest,
} from '@/types/sales';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const PRINTING_KEYS = {
  all: ['sales-printing'] as const,
  printers: ['sales-printing', 'printers'] as const,
  preview: (orderId: string) => ['sales-printing', 'preview', orderId] as const,
} as const;

export function usePrinters() {
  return useQuery({
    queryKey: PRINTING_KEYS.printers,
    queryFn: () => printingService.listPrinters(),
  });
}

export function useRegisterPrinter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterPrinterRequest) =>
      printingService.registerPrinter(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PRINTING_KEYS.printers });
      toast.success('Impressora cadastrada com sucesso.');
    },
    onError: () => {
      toast.error('Nao foi possivel cadastrar a impressora.');
    },
  });
}

export function useDeletePrinter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (printerId: string) => printingService.deletePrinter(printerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PRINTING_KEYS.printers });
      toast.success('Impressora removida.');
    },
    onError: () => {
      toast.error('Falha ao remover impressora.');
    },
  });
}

export function useQueueReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data?: QueueReceiptRequest;
    }) => printingService.queueReceipt(orderId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PRINTING_KEYS.all });
      toast.success('Recibo enviado para a fila de impressao.');
    },
    onError: () => {
      toast.error('Falha ao enfileirar impressao.');
    },
  });
}

export function useReceiptPreview(orderId: string | null) {
  return useQuery({
    queryKey: PRINTING_KEYS.preview(orderId ?? ''),
    queryFn: () => printingService.previewReceipt(orderId!),
    enabled: !!orderId,
  });
}
