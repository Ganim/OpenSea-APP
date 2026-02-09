// Stock module barrel exports
export * from './product.types';
export * from './variant.types';
export * from './item.types';
export * from './warehouse.types';
export * from './supplier.types';
export * from './manufacturer.types';
export * from './category.types';
export * from './template.types';
export * from './volume.types';
export * from './care.types';
export * from './purchase-order.types';
export * from './scan.types';
export * from './inventory.types';
export * from './import.types';
export * from './analytics.types';
export * from './label.types';

// Re-export pagination types (they were re-exported from old stock.ts)
export type { PaginationMeta, PaginatedQuery } from '../pagination';
