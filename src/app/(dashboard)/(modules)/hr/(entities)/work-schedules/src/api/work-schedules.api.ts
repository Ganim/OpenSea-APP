import { workSchedulesService } from '@/services/hr';
import type {
  CreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
  WorkScheduleResponse,
  WorkSchedulesResponse,
  ListWorkSchedulesParams,
} from '@/services/hr/work-schedules.service';
import type { WorkSchedule } from '@/types/hr';

export const workSchedulesApi = {
  async list(params?: ListWorkSchedulesParams): Promise<WorkSchedulesResponse> {
    return workSchedulesService.listWorkSchedules(params);
  },

  async get(id: string): Promise<WorkSchedule> {
    const { workSchedule } = await workSchedulesService.getWorkSchedule(id);
    return workSchedule;
  },

  async create(data: CreateWorkScheduleRequest): Promise<WorkSchedule> {
    const { workSchedule } =
      await workSchedulesService.createWorkSchedule(data);
    return workSchedule;
  },

  async update(
    id: string,
    data: UpdateWorkScheduleRequest
  ): Promise<WorkSchedule> {
    const { workSchedule } = await workSchedulesService.updateWorkSchedule(
      id,
      data
    );
    return workSchedule;
  },

  async delete(id: string): Promise<void> {
    await workSchedulesService.deleteWorkSchedule(id);
  },
};

export type {
  WorkScheduleResponse,
  WorkSchedulesResponse,
  ListWorkSchedulesParams,
};
