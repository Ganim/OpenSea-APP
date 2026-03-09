/**
 * OpenSea OS - Payroll Query Keys
 */

export interface PayrollFilters {
  referenceMonth?: number;
  referenceYear?: number;
  status?: string;
  page?: number;
  perPage?: number;
}

export const payrollKeys = {
  all: ['payrolls'] as const,
  lists: () => [...payrollKeys.all, 'list'] as const,
  list: (filters?: PayrollFilters) =>
    [...payrollKeys.lists(), filters ?? {}] as const,
  details: () => [...payrollKeys.all, 'detail'] as const,
  detail: (id: string) => [...payrollKeys.details(), id] as const,
} as const;

type PayrollKeyFunctions = {
  [K in keyof typeof payrollKeys]: (typeof payrollKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof payrollKeys)[K];
};

export type PayrollQueryKey = PayrollKeyFunctions[keyof PayrollKeyFunctions];

export default payrollKeys;
