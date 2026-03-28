/**
 * OpenSea OS - Bonuses API Module
 */

// Query Keys
export { bonusKeys, type BonusFilters, type BonusQueryKey } from './keys';

// Queries
export {
  useListBonuses,
  type ListBonusesParams,
  type ListBonusesResponse,
} from './list-bonuses.query';

// Mutations
export {
  useCreateBonus,
  useUpdateBonus,
  useDeleteBonus,
  type CreateBonusOptions,
  type UpdateBonusOptions,
  type DeleteBonusOptions,
} from './mutations';

// Legacy API
export * from './bonuses.api';
