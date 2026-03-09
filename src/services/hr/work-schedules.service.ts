import { apiClient } from '@/lib/api-client';
import type { WorkSchedule } from '@/types/hr';

export interface WorkSchedulesResponse {
  workSchedules: WorkSchedule[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkScheduleResponse {
  workSchedule: WorkSchedule;
}

export interface CreateWorkScheduleRequest {
  name: string;
  description?: string;
  mondayStart?: string;
  mondayEnd?: string;
  tuesdayStart?: string;
  tuesdayEnd?: string;
  wednesdayStart?: string;
  wednesdayEnd?: string;
  thursdayStart?: string;
  thursdayEnd?: string;
  fridayStart?: string;
  fridayEnd?: string;
  saturdayStart?: string;
  saturdayEnd?: string;
  sundayStart?: string;
  sundayEnd?: string;
  breakDuration?: number;
  isActive?: boolean;
}

export interface UpdateWorkScheduleRequest {
  name?: string;
  description?: string;
  mondayStart?: string | null;
  mondayEnd?: string | null;
  tuesdayStart?: string | null;
  tuesdayEnd?: string | null;
  wednesdayStart?: string | null;
  wednesdayEnd?: string | null;
  thursdayStart?: string | null;
  thursdayEnd?: string | null;
  fridayStart?: string | null;
  fridayEnd?: string | null;
  saturdayStart?: string | null;
  saturdayEnd?: string | null;
  sundayStart?: string | null;
  sundayEnd?: string | null;
  breakDuration?: number;
  isActive?: boolean;
}

export interface ListWorkSchedulesParams {
  page?: number;
  perPage?: number;
  activeOnly?: boolean;
}

export const workSchedulesService = {
  async listWorkSchedules(
    params?: ListWorkSchedulesParams
  ): Promise<WorkSchedulesResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    if (params?.activeOnly !== undefined)
      query.append('activeOnly', String(params.activeOnly));

    const qs = query.toString();
    return apiClient.get<WorkSchedulesResponse>(
      `/v1/hr/work-schedules${qs ? `?${qs}` : ''}`
    );
  },

  async getWorkSchedule(id: string): Promise<WorkScheduleResponse> {
    return apiClient.get<WorkScheduleResponse>(`/v1/hr/work-schedules/${id}`);
  },

  async createWorkSchedule(
    data: CreateWorkScheduleRequest
  ): Promise<WorkScheduleResponse> {
    return apiClient.post<WorkScheduleResponse>('/v1/hr/work-schedules', data);
  },

  async updateWorkSchedule(
    id: string,
    data: UpdateWorkScheduleRequest
  ): Promise<WorkScheduleResponse> {
    return apiClient.put<WorkScheduleResponse>(
      `/v1/hr/work-schedules/${id}`,
      data
    );
  },

  async deleteWorkSchedule(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/work-schedules/${id}`);
  },
};
