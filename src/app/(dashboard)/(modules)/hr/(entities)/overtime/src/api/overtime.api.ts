/**
 * OpenSea OS - Overtime API Wrapper
 */

import { overtimeService } from '@/services/hr/overtime.service';
import type {
  CreateOvertimeRequest,
  ApproveOvertimeRequest,
  OvertimeResponse,
  OvertimeListResponse,
  ListOvertimeParams,
} from '@/services/hr/overtime.service';
import type { Overtime } from '@/types/hr';

export const overtimeApi = {
  async list(params?: ListOvertimeParams): Promise<OvertimeListResponse> {
    return overtimeService.list(params);
  },

  async get(id: string): Promise<Overtime> {
    const { overtime } = await overtimeService.get(id);
    return overtime;
  },

  async create(data: CreateOvertimeRequest): Promise<Overtime> {
    const { overtime } = await overtimeService.create(data);
    return overtime;
  },

  async approve(id: string, data?: ApproveOvertimeRequest): Promise<Overtime> {
    const { overtime } = await overtimeService.approve(id, data);
    return overtime;
  },
};

export type { OvertimeResponse, OvertimeListResponse, ListOvertimeParams };
