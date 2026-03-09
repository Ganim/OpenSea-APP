/**
 * OpenSea OS - Overtime Query Keys
 */

export interface OvertimeFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  approved?: boolean;
  page?: number;
  perPage?: number;
}

export const overtimeKeys = {
  all: ['overtime'] as const,
  lists: () => [...overtimeKeys.all, 'list'] as const,
  list: (filters?: OvertimeFilters) =>
    [...overtimeKeys.lists(), filters ?? {}] as const,
  details: () => [...overtimeKeys.all, 'detail'] as const,
  detail: (id: string) => [...overtimeKeys.details(), id] as const,
} as const;

type OvertimeKeyFunctions = {
  [K in keyof typeof overtimeKeys]: (typeof overtimeKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof overtimeKeys)[K];
};

export type OvertimeQueryKey = OvertimeKeyFunctions[keyof OvertimeKeyFunctions];

export default overtimeKeys;
