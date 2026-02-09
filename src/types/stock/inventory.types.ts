// Inventory Cycle & Count Types

import type { PaginationMeta } from '../pagination';
import type { Location } from './warehouse.types';

export type InventoryCycleStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';
export type InventoryCountStatus =
  | 'PENDING'
  | 'COUNTED'
  | 'ADJUSTED'
  | 'VERIFIED';

export interface InventoryCycle {
  id: string;
  name: string;
  description?: string;
  status: InventoryCycleStatus;
  warehouseId?: string;
  zoneIds?: string[];
  startedAt?: Date;
  startedBy?: string;
  completedAt?: Date;
  completedBy?: string;
  totalBins?: number;
  countedBins?: number;
  adjustedBins?: number;
  counts?: InventoryCount[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface InventoryCount {
  id: string;
  cycleId: string;
  binId: string;
  bin?: Location;
  status: InventoryCountStatus;
  expectedQuantity?: number;
  countedQuantity?: number;
  adjustedQuantity?: number;
  variance?: number;
  countedAt?: Date;
  countedBy?: string;
  adjustedAt?: Date;
  adjustedBy?: string;
  notes?: string;
  items?: Array<{
    itemId: string;
    expectedQuantity: number;
    countedQuantity?: number;
    variance?: number;
  }>;
}

export interface CreateInventoryCycleRequest {
  name: string;
  description?: string;
  warehouseId?: string;
  zoneIds?: string[];
  binIds?: string[];
}

export interface StartCycleRequest {
  notes?: string;
}

export interface CompleteCycleRequest {
  notes?: string;
  autoAdjust?: boolean;
}

export interface SubmitCountRequest {
  countedQuantity: number;
  itemCounts?: Array<{
    itemId: string;
    countedQuantity: number;
  }>;
  notes?: string;
}

export interface AdjustCountRequest {
  adjustedQuantity: number;
  reason: string;
}

export interface InventoryCyclesResponse {
  cycles: InventoryCycle[];
  pagination?: PaginationMeta;
}

export interface InventoryCycleResponse {
  cycle: InventoryCycle;
}

export interface InventoryCountsResponse {
  counts: InventoryCount[];
}
