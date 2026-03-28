/**
 * OpenSea OS - Payroll API Module
 */

// Query Keys
export { payrollKeys, type PayrollFilters, type PayrollQueryKey } from './keys';

// Queries
export {
  useListPayrolls,
  type ListPayrollsParams,
  type ListPayrollsResponse,
} from './list-payrolls.query';

// Mutations
export {
  useCreatePayroll,
  useCalculatePayroll,
  useApprovePayroll,
  usePayPayroll,
  useCancelPayroll,
  type CreatePayrollOptions,
  type CalculatePayrollOptions,
  type ApprovePayrollOptions,
  type PayPayrollOptions,
  type CancelPayrollOptions,
} from './mutations';

// Legacy API
export * from './payroll.api';
