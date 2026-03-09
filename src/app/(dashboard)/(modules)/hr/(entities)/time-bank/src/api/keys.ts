/**
 * OpenSea OS - Time Bank Query Keys
 */

export interface TimeBankFilters {
  employeeId?: string;
  year?: number;
}

export const timeBankKeys = {
  all: ['time-banks'] as const,
  lists: () => [...timeBankKeys.all, 'list'] as const,
  list: (filters?: TimeBankFilters) =>
    [...timeBankKeys.lists(), filters ?? {}] as const,
  details: () => [...timeBankKeys.all, 'detail'] as const,
  detail: (employeeId: string, year?: number) =>
    [...timeBankKeys.details(), employeeId, year] as const,
} as const;

type TimeBankKeyFunctions = {
  [K in keyof typeof timeBankKeys]: (typeof timeBankKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof timeBankKeys)[K];
};

export type TimeBankQueryKey = TimeBankKeyFunctions[keyof TimeBankKeyFunctions];

export default timeBankKeys;
