/**
 * OpenSea OS - Variants API Module
 */

// Query Keys
export { variantKeys, type VariantFilters, type VariantQueryKey } from './keys';

// Queries
export {
  useListVariants,
  type ListVariantsParams,
  type ListVariantsResponse,
  type ListVariantsOptions,
} from './list-variants.query';

export { useGetVariant, type GetVariantOptions } from './get-variant.query';

// Mutations
export {
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  type CreateVariantData,
  type CreateVariantOptions,
  type UpdateVariantVariables,
  type UpdateVariantOptions,
  type DeleteVariantVariables,
  type DeleteVariantOptions,
} from './mutations';
