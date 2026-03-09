import { apiClient } from '@/lib/api-client';
import type { Payroll } from '@/types/hr';

export interface PayrollResponse {
  payroll: Payroll;
}

export interface PayrollWithItemsResponse {
  payroll: Payroll;
  items: PayrollItemDTO[];
}

export interface PayrollItemDTO {
  id: string;
  payrollId: string;
  employeeId: string;
  type: string;
  description: string;
  amount: number;
  isDeduction: boolean;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollsResponse {
  payrolls: Payroll[];
}

export interface CreatePayrollRequest {
  referenceMonth: number;
  referenceYear: number;
}

export interface ListPayrollsParams {
  referenceMonth?: number;
  referenceYear?: number;
  status?: string;
  page?: number;
  perPage?: number;
}

export const payrollService = {
  async create(data: CreatePayrollRequest): Promise<PayrollResponse> {
    return apiClient.post<PayrollResponse>('/v1/hr/payrolls', data);
  },

  async calculate(payrollId: string): Promise<PayrollWithItemsResponse> {
    return apiClient.post<PayrollWithItemsResponse>(`/v1/hr/payrolls/${payrollId}/calculate`, {});
  },

  async approve(payrollId: string): Promise<PayrollResponse> {
    return apiClient.post<PayrollResponse>(`/v1/hr/payrolls/${payrollId}/approve`, {});
  },

  async pay(payrollId: string): Promise<PayrollResponse> {
    return apiClient.post<PayrollResponse>(`/v1/hr/payrolls/${payrollId}/pay`, {});
  },

  async cancel(payrollId: string): Promise<PayrollResponse> {
    return apiClient.post<PayrollResponse>(`/v1/hr/payrolls/${payrollId}/cancel`, {});
  },

  async get(payrollId: string): Promise<PayrollResponse> {
    return apiClient.get<PayrollResponse>(`/v1/hr/payrolls/${payrollId}`);
  },

  async list(params?: ListPayrollsParams): Promise<PayrollsResponse> {
    const query = new URLSearchParams();
    if (params?.referenceMonth) query.append('referenceMonth', String(params.referenceMonth));
    if (params?.referenceYear) query.append('referenceYear', String(params.referenceYear));
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<PayrollsResponse>(`/v1/hr/payrolls${qs ? `?${qs}` : ''}`);
  },
};
