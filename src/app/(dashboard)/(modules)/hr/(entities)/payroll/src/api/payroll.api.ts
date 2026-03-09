/**
 * OpenSea OS - Payroll API
 */

import { payrollService } from '@/services/hr';
import type {
  CreatePayrollRequest,
  PayrollResponse,
  PayrollWithItemsResponse,
  PayrollsResponse,
  ListPayrollsParams,
} from '@/services/hr/payroll.service';
import type { Payroll } from '@/types/hr';

export const payrollApi = {
  async list(params?: ListPayrollsParams): Promise<PayrollsResponse> {
    return payrollService.list(params);
  },

  async get(id: string): Promise<Payroll> {
    const { payroll } = await payrollService.get(id);
    return payroll;
  },

  async create(data: CreatePayrollRequest): Promise<Payroll> {
    const { payroll } = await payrollService.create(data);
    return payroll;
  },

  async calculate(id: string): Promise<PayrollWithItemsResponse> {
    return payrollService.calculate(id);
  },

  async approve(id: string): Promise<Payroll> {
    const { payroll } = await payrollService.approve(id);
    return payroll;
  },

  async pay(id: string): Promise<Payroll> {
    const { payroll } = await payrollService.pay(id);
    return payroll;
  },

  async cancel(id: string): Promise<Payroll> {
    const { payroll } = await payrollService.cancel(id);
    return payroll;
  },
};

export type {
  PayrollResponse,
  PayrollWithItemsResponse,
  PayrollsResponse,
  ListPayrollsParams,
};
