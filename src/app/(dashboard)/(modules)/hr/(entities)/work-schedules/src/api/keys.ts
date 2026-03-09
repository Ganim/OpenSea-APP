/**
 * OpenSea OS - Work Schedules Query Keys
 */

export interface WorkScheduleFilters {
  page?: number;
  perPage?: number;
  activeOnly?: boolean;
}

export const workScheduleKeys = {
  all: ['work-schedules'] as const,
  lists: () => [...workScheduleKeys.all, 'list'] as const,
  list: (filters?: WorkScheduleFilters) =>
    [...workScheduleKeys.lists(), filters ?? {}] as const,
  details: () => [...workScheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...workScheduleKeys.details(), id] as const,
} as const;

type WorkScheduleKeyFunctions = {
  [K in keyof typeof workScheduleKeys]: (typeof workScheduleKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof workScheduleKeys)[K];
};

export type WorkScheduleQueryKey =
  WorkScheduleKeyFunctions[keyof WorkScheduleKeyFunctions];

export default workScheduleKeys;
