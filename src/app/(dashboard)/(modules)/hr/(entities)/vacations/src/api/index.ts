/**
 * OpenSea OS - Vacations API Module (HR)
 *
 * Exporta queries, mutations e utilitários de férias.
 */

/* ===========================================
   QUERY KEYS
   =========================================== */
export {
  vacationKeys,
  type VacationFilters,
  type VacationQueryKey,
} from './keys';

/* ===========================================
   QUERIES
   =========================================== */
export {
  useListVacations,
  type ListVacationsParams,
  type ListVacationsResponse,
  type ListVacationsOptions,
} from './list-vacations.query';

/* ===========================================
   MUTATIONS
   =========================================== */
export {
  useCreateVacation,
  useScheduleVacation,
  useStartVacation,
  useCompleteVacation,
  useSellVacationDays,
  useCancelVacationSchedule,
} from './mutations';

/* ===========================================
   API
   =========================================== */
export { vacationsApi } from './vacations.api';
