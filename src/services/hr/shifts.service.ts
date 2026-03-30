import { apiClient } from '@/lib/api-client';
import type {
  Shift,
  ShiftAssignment,
  CreateShiftData,
  UpdateShiftData,
  AssignEmployeeToShiftData,
  TransferEmployeeShiftData,
} from '@/types/hr';

export interface ShiftsResponse {
  shifts: Shift[];
}

export interface ShiftResponse {
  shift: Shift;
  assignmentCount: number;
}

export interface ShiftAssignmentsResponse {
  shiftAssignments: ShiftAssignment[];
}

export interface ShiftAssignmentResponse {
  shiftAssignment: ShiftAssignment;
}

export interface ListShiftsParams {
  activeOnly?: boolean;
}

export const shiftsService = {
  async listShifts(params?: ListShiftsParams): Promise<ShiftsResponse> {
    const query = new URLSearchParams();
    if (params?.activeOnly !== undefined)
      query.append('activeOnly', String(params.activeOnly));

    const qs = query.toString();
    return apiClient.get<ShiftsResponse>(
      `/v1/hr/shifts${qs ? `?${qs}` : ''}`
    );
  },

  async getShift(id: string): Promise<ShiftResponse> {
    return apiClient.get<ShiftResponse>(`/v1/hr/shifts/${id}`);
  },

  async createShift(data: CreateShiftData): Promise<ShiftResponse> {
    return apiClient.post<ShiftResponse>('/v1/hr/shifts', data);
  },

  async updateShift(
    id: string,
    data: UpdateShiftData
  ): Promise<ShiftResponse> {
    return apiClient.put<ShiftResponse>(`/v1/hr/shifts/${id}`, data);
  },

  async deleteShift(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/shifts/${id}`);
  },

  // Assignments

  async listShiftAssignments(
    shiftId: string
  ): Promise<ShiftAssignmentsResponse> {
    return apiClient.get<ShiftAssignmentsResponse>(
      `/v1/hr/shifts/${shiftId}/assignments`
    );
  },

  async assignEmployee(
    shiftId: string,
    data: AssignEmployeeToShiftData
  ): Promise<ShiftAssignmentResponse> {
    return apiClient.post<ShiftAssignmentResponse>(
      `/v1/hr/shifts/${shiftId}/assignments`,
      data
    );
  },

  async unassignEmployee(assignmentId: string): Promise<void> {
    return apiClient.delete<void>(
      `/v1/hr/shift-assignments/${assignmentId}`
    );
  },

  async transferEmployee(
    data: TransferEmployeeShiftData
  ): Promise<ShiftAssignmentResponse> {
    return apiClient.post<ShiftAssignmentResponse>(
      '/v1/hr/shift-assignments/transfer',
      data
    );
  },
};
