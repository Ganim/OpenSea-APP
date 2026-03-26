/**
 * OpenSea OS - Deductions API Module
 */

// Query Keys
export {
  deductionKeys,
  type DeductionFilters,
  type DeductionQueryKey,
} from './keys';

// Queries
export {
  useListDeductions,
  type ListDeductionsParams,
  type ListDeductionsResponse,
  type ListDeductionsOptions,
} from './list-deductions.query';

// Mutations
export {
  useCreateDeduction,
  useUpdateDeduction,
  useDeleteDeduction,
  type CreateDeductionOptions,
  type UpdateDeductionOptions,
  type DeleteDeductionOptions,
} from './mutations';

// Legacy API
export * from './deductions.api';
