/**
 * Movements Module
 * Centralized exports for the stock movements module
 */

// Components
export { MovementFilters } from './components/movement-filters';
export { MovementRow } from './components/movement-row';
export { MovementStatsGrid } from './components/movement-stats';
export { MovementTimeline } from './components/movement-timeline';
export { StatCard } from './components/stat-card';

// Constants
export { MOVEMENT_CONFIG, MOVEMENT_TYPE_OPTIONS } from './constants';

// Types
export * from './types/movements.types';

// Utils
export {
  computeMovementStats,
  filterMovementsByDateRange,
  filterMovementsBySearch,
  formatDate,
  formatDateTime,
  groupMovementsByDate,
} from './utils';
