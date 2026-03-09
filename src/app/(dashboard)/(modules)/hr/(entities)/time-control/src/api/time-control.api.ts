import { timeControlService } from '@/services/hr';
import type {
  ClockInOutRequest,
  CalculateWorkedHoursRequest,
  TimeEntriesResponse,
  TimeEntryResponse,
  WorkedHoursResponse,
  ListTimeEntriesParams,
} from '@/services/hr/time-control.service';
import type { TimeEntry } from '@/types/hr';

export const timeControlApi = {
  async list(params?: ListTimeEntriesParams): Promise<TimeEntriesResponse> {
    return timeControlService.listTimeEntries(params);
  },

  async clockIn(data: ClockInOutRequest): Promise<TimeEntry> {
    const { timeEntry } = await timeControlService.clockIn(data);
    return timeEntry;
  },

  async clockOut(data: ClockInOutRequest): Promise<TimeEntry> {
    const { timeEntry } = await timeControlService.clockOut(data);
    return timeEntry;
  },

  async calculateWorkedHours(
    data: CalculateWorkedHoursRequest
  ): Promise<WorkedHoursResponse> {
    return timeControlService.calculateWorkedHours(data);
  },
};

export type {
  TimeEntriesResponse,
  TimeEntryResponse,
  WorkedHoursResponse,
  ListTimeEntriesParams,
  ClockInOutRequest,
  CalculateWorkedHoursRequest,
};
