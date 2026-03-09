/**
 * OpenSea OS - Work Schedules API Module
 */

// Query Keys
export {
  workScheduleKeys,
  type WorkScheduleFilters,
  type WorkScheduleQueryKey,
} from './keys';

// Queries
export {
  useListWorkSchedules,
  type ListWorkSchedulesParams,
  type ListWorkSchedulesResponse,
  type ListWorkSchedulesOptions,
} from './list-work-schedules.query';

// Mutations
export {
  useCreateWorkSchedule,
  useUpdateWorkSchedule,
  useDeleteWorkSchedule,
  type CreateWorkScheduleOptions,
  type UpdateWorkScheduleVariables,
  type UpdateWorkScheduleOptions,
  type DeleteWorkScheduleOptions,
} from './mutations';

// Legacy API
export * from './work-schedules.api';
