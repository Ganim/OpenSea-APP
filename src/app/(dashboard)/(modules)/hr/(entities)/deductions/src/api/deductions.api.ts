import { deductionsService } from '@/services/hr';
import type {
  CreateDeductionRequest,
  UpdateDeductionRequest,
  DeductionResponse,
  DeductionsResponse,
  ListDeductionsParams,
} from '@/services/hr/deductions.service';
import type { Deduction } from '@/types/hr';

export const deductionsApi = {
  async list(params?: ListDeductionsParams): Promise<DeductionsResponse> {
    return deductionsService.list(params);
  },

  async get(id: string): Promise<Deduction> {
    const { deduction } = await deductionsService.get(id);
    return deduction;
  },

  async create(data: CreateDeductionRequest): Promise<Deduction> {
    const { deduction } = await deductionsService.create(data);
    return deduction;
  },

  async update(
    id: string,
    data: UpdateDeductionRequest
  ): Promise<Deduction> {
    const { deduction } = await deductionsService.update(id, data);
    return deduction;
  },

  async delete(id: string): Promise<void> {
    await deductionsService.delete(id);
  },
};

export type { DeductionResponse, DeductionsResponse, ListDeductionsParams };
