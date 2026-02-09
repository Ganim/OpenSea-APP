// Analytics & Dashboard Types

import type { ItemMovementExtended } from './item.types';

export type CompanyType = 'MANUFACTURER' | 'SUPPLIER' | 'BOTH';

export interface StockSummary {
  totalProducts: number;
  totalVariants: number;
  totalItems: number;
  totalValue: number;
  byWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    itemCount: number;
    value: number;
  }>;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    itemCount: number;
    value: number;
  }>;
  lowStockAlerts: Array<{
    variantId: string;
    variantName: string;
    currentStock: number;
    minStock: number;
    reorderPoint: number;
  }>;
}

export interface MovementsSummary {
  period: string;
  totalEntries: number;
  totalExits: number;
  totalTransfers: number;
  totalAdjustments: number;
  entriesValue: number;
  exitsValue: number;
  netChange: number;
  pendingApprovals: number;
  byDay: Array<{
    date: string;
    entries: number;
    exits: number;
    transfers: number;
  }>;
}

export interface DashboardData {
  stockSummary: StockSummary;
  movementsSummary: MovementsSummary;
  recentMovements: ItemMovementExtended[];
  pendingApprovals: ItemMovementExtended[];
  alerts: Array<{
    type: 'LOW_STOCK' | 'EXPIRED' | 'PENDING_APPROVAL' | 'INVENTORY_VARIANCE';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    entityType?: string;
    entityId?: string;
  }>;
}
