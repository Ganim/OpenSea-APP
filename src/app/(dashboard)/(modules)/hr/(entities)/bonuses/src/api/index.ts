/**
 * OpenSea OS - Bonuses API Module
 */

// Query Keys
export {
  bonusKeys,
  type BonusFilters,
  type BonusQueryKey,
} from './keys';

// Queries
export {
  useListBonuses,
  type ListBonusesParams,
  type ListBonusesResponse,
  type ListBonusesOptions,
} from './list-bonuses.query';

// Mutations
export {
  useCreateBonus,
  useDeleteBonus,
  type CreateBonusOptions,
  type DeleteBonusOptions,
} from './mutations';

// Legacy API
export * from './bonuses.api';
