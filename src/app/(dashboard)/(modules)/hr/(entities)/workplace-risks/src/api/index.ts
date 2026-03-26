/**
 * OpenSea OS - Workplace Risks API Module
 */

// Query Keys
export { workplaceRiskKeys, type WorkplaceRiskFilters } from './keys';

// Queries
export {
  useListWorkplaceRisks,
  type ListWorkplaceRisksResponse,
  type ListWorkplaceRisksOptions,
} from './list-workplace-risks.query';

// Mutations
export {
  useCreateWorkplaceRisk,
  useUpdateWorkplaceRisk,
  useDeleteWorkplaceRisk,
  useDeleteWorkplaceRiskDynamic,
  type CreateWorkplaceRiskOptions,
  type UpdateWorkplaceRiskOptions,
  type DeleteWorkplaceRiskOptions,
} from './mutations';
