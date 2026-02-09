// Scan Types

import type { Item } from './item.types';
import type { Variant } from './variant.types';
import type { Product } from './product.types';
import type { Location } from './warehouse.types';
import type { Volume, SerializedLabel, ScanEntityType } from './volume.types';

export interface ScanRequest {
  code: string;
  context?: 'ENTRY' | 'EXIT' | 'TRANSFER' | 'INFO' | 'INVENTORY';
}

export interface ScanResult {
  entityType: ScanEntityType;
  entityId: string;
  entity: Item | Variant | Product | Location | Volume | SerializedLabel;
  suggestions?: ScanSuggestion[];
}

export interface ScanSuggestion {
  action: string;
  label: string;
  endpoint: string;
  method: string;
}

export interface BatchScanRequest {
  codes: string[];
  context?: 'ENTRY' | 'EXIT' | 'TRANSFER' | 'INFO' | 'INVENTORY';
}

export interface BatchScanResponse {
  results: Array<{
    code: string;
    success: boolean;
    result?: ScanResult;
    error?: string;
  }>;
}
