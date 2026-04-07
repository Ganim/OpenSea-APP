import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  ListPrintersResponse,
  PreviewReceiptResponse,
  QueueReceiptRequest,
  QueueReceiptResponse,
  RegisterPrinterRequest,
  RegisterPrinterResponse,
} from '@/types/sales';

export const printingService = {
  async listPrinters(): Promise<ListPrintersResponse> {
    return apiClient.get<ListPrintersResponse>(
      API_ENDPOINTS.SALES_PRINTING.PRINTERS.LIST
    );
  },

  async registerPrinter(
    data: RegisterPrinterRequest
  ): Promise<RegisterPrinterResponse> {
    return apiClient.post<RegisterPrinterResponse>(
      API_ENDPOINTS.SALES_PRINTING.PRINTERS.CREATE,
      data
    );
  },

  async deletePrinter(printerId: string): Promise<void> {
    return apiClient.delete<void>(
      API_ENDPOINTS.SALES_PRINTING.PRINTERS.DELETE(printerId)
    );
  },

  async queueReceipt(
    orderId: string,
    data?: QueueReceiptRequest
  ): Promise<QueueReceiptResponse> {
    return apiClient.post<QueueReceiptResponse>(
      API_ENDPOINTS.SALES_PRINTING.RECEIPTS.QUEUE(orderId),
      data ?? {}
    );
  },

  async previewReceipt(orderId: string): Promise<PreviewReceiptResponse> {
    return apiClient.get<PreviewReceiptResponse>(
      API_ENDPOINTS.SALES_PRINTING.RECEIPTS.PREVIEW(orderId)
    );
  },
};
