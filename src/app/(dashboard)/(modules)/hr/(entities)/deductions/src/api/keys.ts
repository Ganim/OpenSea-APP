/**
 * OpenSea OS - Deductions Query Keys
 */

export interface DeductionFilters {
  employeeId?: string;
  isApplied?: boolean;
  isRecurring?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export const deductionKeys = {
  all: ['deductions'] as const,
  lists: () => [...deductionKeys.all, 'list'] as const,
  list: (filters?: DeductionFilters) =>
    [...deductionKeys.lists(), filters ?? {}] as const,
  details: () => [...deductionKeys.all, 'detail'] as const,
  detail: (id: string) => [...deductionKeys.details(), id] as const,
} as const;

type DeductionKeyFunctions = {
  [K in keyof typeof deductionKeys]: (typeof deductionKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof deductionKeys)[K];
};

export type DeductionQueryKey =
  DeductionKeyFunctions[keyof DeductionKeyFunctions];

export default deductionKeys;
