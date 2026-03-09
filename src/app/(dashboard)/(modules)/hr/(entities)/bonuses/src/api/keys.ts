/**
 * OpenSea OS - Bonuses Query Keys
 */

export interface BonusFilters {
  employeeId?: string;
  isPaid?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export const bonusKeys = {
  all: ['bonuses'] as const,
  lists: () => [...bonusKeys.all, 'list'] as const,
  list: (filters?: BonusFilters) =>
    [...bonusKeys.lists(), filters ?? {}] as const,
  details: () => [...bonusKeys.all, 'detail'] as const,
  detail: (id: string) => [...bonusKeys.details(), id] as const,
} as const;

type BonusKeyFunctions = {
  [K in keyof typeof bonusKeys]: (typeof bonusKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof bonusKeys)[K];
};

export type BonusQueryKey = BonusKeyFunctions[keyof BonusKeyFunctions];

export default bonusKeys;
