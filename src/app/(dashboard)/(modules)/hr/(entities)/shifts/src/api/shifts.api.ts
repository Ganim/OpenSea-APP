import { shiftsService } from '@/services/hr';
import type {
  ShiftsResponse,
  ShiftResponse,
  ShiftAssignmentsResponse,
  ShiftAssignmentResponse,
  ListShiftsParams,
} from '@/services/hr/shifts.service';
import type {
  Shift,
  CreateShiftData,
  UpdateShiftData,
  AssignEmployeeToShiftData,
  TransferEmployeeShiftData,
} from '@/types/hr';

export const shiftsApi = {
  async list(params?: ListShiftsParams): Promise<ShiftsResponse> {
    return shiftsService.listShifts(params);
  },

  async get(id: string): Promise<ShiftResponse> {
    return shiftsService.getShift(id);
  },

  async create(data: CreateShiftData): Promise<Shift> {
    const { shift } = await shiftsService.createShift(data);
    return shift;
  },

  async update(id: string, data: UpdateShiftData): Promise<Shift> {
    const { shift } = await shiftsService.updateShift(id, data);
    return shift;
  },

  async delete(id: string): Promise<void> {
    await shiftsService.deleteShift(id);
  },

  async listAssignments(shiftId: string): Promise<ShiftAssignmentsResponse> {
    return shiftsService.listShiftAssignments(shiftId);
  },

  async assignEmployee(
    shiftId: string,
    data: AssignEmployeeToShiftData
  ): Promise<ShiftAssignmentResponse> {
    return shiftsService.assignEmployee(shiftId, data);
  },

  async unassignEmployee(assignmentId: string): Promise<void> {
    return shiftsService.unassignEmployee(assignmentId);
  },

  async transferEmployee(
    data: TransferEmployeeShiftData
  ): Promise<ShiftAssignmentResponse> {
    return shiftsService.transferEmployee(data);
  },
};

export type {
  ShiftsResponse,
  ShiftResponse,
  ShiftAssignmentsResponse,
  ShiftAssignmentResponse,
  ListShiftsParams,
};
