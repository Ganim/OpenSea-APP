export interface TimeEntryFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  entryType?: string;
  page?: number;
  perPage?: number;
}

export const timeEntryKeys = {
  all: ['time-entries'] as const,
  lists: () => [...timeEntryKeys.all, 'list'] as const,
  list: (filters?: TimeEntryFilters) =>
    [...timeEntryKeys.lists(), filters ?? {}] as const,
  workedHours: (employeeId: string, startDate: string, endDate: string) =>
    [
      ...timeEntryKeys.all,
      'worked-hours',
      employeeId,
      startDate,
      endDate,
    ] as const,
};

export type TimeEntryQueryKey =
  | ReturnType<typeof timeEntryKeys.lists>
  | ReturnType<typeof timeEntryKeys.list>
  | ReturnType<typeof timeEntryKeys.workedHours>;
