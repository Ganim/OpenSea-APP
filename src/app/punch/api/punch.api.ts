import { timeControlService } from '@/services/hr';
import type { ClockInOutRequest } from '@/services/hr/time-control.service';
import type { TimeEntry } from '@/types/hr';

export interface PunchRequest {
  employeeId: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export const punchApi = {
  async clockIn(data: PunchRequest): Promise<TimeEntry> {
    const request: ClockInOutRequest = {
      employeeId: data.employeeId,
      latitude: data.latitude,
      longitude: data.longitude,
      notes: data.notes,
    };
    const response = await timeControlService.clockIn(request);
    return response.timeEntry;
  },

  async clockOut(data: PunchRequest): Promise<TimeEntry> {
    const request: ClockInOutRequest = {
      employeeId: data.employeeId,
      latitude: data.latitude,
      longitude: data.longitude,
      notes: data.notes,
    };
    const response = await timeControlService.clockOut(request);
    return response.timeEntry;
  },
};
