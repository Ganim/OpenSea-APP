/**
 * OpenSea OS - Dependants API Module
 */

// Query Keys
export {
  dependantKeys,
  type DependantFilters,
  type DependantQueryKey,
} from './keys';

// Queries
export {
  useListDependants,
  type ListDependantsParams,
  type ListDependantsPage,
} from './list-dependants.query';

// Mutations
export {
  useCreateDependant,
  useDeleteDependant,
  type CreateDependantMutationData,
  type CreateDependantOptions,
  type DeleteDependantMutationData,
  type DeleteDependantOptions,
} from './mutations';
