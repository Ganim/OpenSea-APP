// ============================================
// WAREHOUSES — Global hook for cross-module use
// Re-exports from the locations API module
// ============================================

export {
  useWarehouses,
  useWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
  usePrefetchWarehouses,
} from '@/app/(dashboard)/(modules)/stock/(entities)/locations/src/api';
