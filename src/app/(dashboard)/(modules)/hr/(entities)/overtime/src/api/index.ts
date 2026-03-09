/**
 * OpenSea OS - Overtime API Module
 */

// Query Keys
export {
  overtimeKeys,
  type OvertimeFilters,
  type OvertimeQueryKey,
} from './keys';

// Queries
export {
  useListOvertime,
  type ListOvertimeParams,
  type ListOvertimeResponse,
  type ListOvertimeOptions,
} from './list-overtime.query';

// Mutations
export {
  useCreateOvertime,
  useApproveOvertime,
  type CreateOvertimeOptions,
  type ApproveOvertimeOptions,
} from './mutations';

// Legacy API
export * from './overtime.api';
