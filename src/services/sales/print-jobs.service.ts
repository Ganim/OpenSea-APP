import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreatePrintJobRequest,
  CreatePrintJobResponse,
  PrintJobsResponse,
} from '@/types/sales';

export const printJobsService = {
  async list(query?: {
    status?: string;
    printerId?: string;
    page?: number;
    limit?: number;
  }): Promise<PrintJobsResponse> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.printerId) params.append('printerId', query.printerId);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const qs = params.toString();
    const url = qs
      ? `${API_ENDPOINTS.SALES_PRINTING.JOBS.LIST}?${qs}`
      : API_ENDPOINTS.SALES_PRINTING.JOBS.LIST;

    return apiClient.get<PrintJobsResponse>(url);
  },

  async create(data: CreatePrintJobRequest): Promise<CreatePrintJobResponse> {
    return apiClient.post<CreatePrintJobResponse>(
      API_ENDPOINTS.SALES_PRINTING.JOBS.CREATE,
      data
    );
  },

  async retry(jobId: string): Promise<CreatePrintJobResponse> {
    return apiClient.post<CreatePrintJobResponse>(
      API_ENDPOINTS.SALES_PRINTING.JOBS.RETRY(jobId)
    );
  },

  async cancel(jobId: string): Promise<void> {
    return apiClient.delete<void>(
      API_ENDPOINTS.SALES_PRINTING.JOBS.CANCEL(jobId)
    );
  },
};
