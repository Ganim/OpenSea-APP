import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface DRENode {
  categoryId: string;
  categoryName: string;
  level: number;
  currentPeriod: number;
  previousPeriod: number;
  variationPercent: number;
  children: DRENode[];
}

export interface InteractiveDREResponse {
  revenue: DRENode;
  expenses: DRENode;
  netResult: number;
  previousNetResult: number;
  variationPercent: number;
  period: { start: string; end: string };
  previousPeriod: { start: string; end: string };
}

export type ExportFormat = 'CSV' | 'PDF' | 'XLSX' | 'DOCX';
export type ReportType = 'ENTRIES' | 'DRE' | 'BALANCE' | 'CASHFLOW';

export const financeReportsService = {
  async getInteractiveDRE(params: {
    startDate: string;
    endDate: string;
    categoryId?: string;
  }): Promise<InteractiveDREResponse> {
    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    if (params.categoryId) query.append('categoryId', params.categoryId);

    return apiClient.get<InteractiveDREResponse>(
      `/v1/finance/dashboard/dre?${query.toString()}`
    );
  },

  async exportReport(params: {
    reportType: ReportType;
    format: ExportFormat;
    startDate: string;
    endDate: string;
    type?: string;
  }): Promise<Blob> {
    const baseUrl =
      typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3333'
        : 'http://127.0.0.1:3333';

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const response = await fetch(
      `${baseUrl}${API_ENDPOINTS.FINANCE_DASHBOARD.EXPORT_ACCOUNTING}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reportType: params.reportType,
          format: params.format,
          startDate: params.startDate,
          endDate: params.endDate,
          type: params.type,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao exportar relatorio: ${response.statusText}`);
    }

    return response.blob();
  },
};
