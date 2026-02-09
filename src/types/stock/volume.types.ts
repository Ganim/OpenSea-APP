// Volume & Serialized Label Types

import type { PaginationMeta, PaginatedQuery } from '../pagination';
import type { Item } from './item.types';
import type { Variant } from './variant.types';
import type { Product } from './product.types';

export type VolumeStatus = 'OPEN' | 'CLOSED' | 'DELIVERED' | 'RETURNED';
export type SerializedLabelStatus = 'AVAILABLE' | 'USED' | 'VOIDED';
export type ScanEntityType =
  | 'ITEM'
  | 'VARIANT'
  | 'PRODUCT'
  | 'LOCATION'
  | 'VOLUME'
  | 'LABEL';

export interface Volume {
  id: string;
  code: string;
  name?: string;
  status: VolumeStatus;
  serializedLabelId?: string;
  serializedLabel?: SerializedLabel;
  destinationRef?: string;
  notes?: string;
  closedAt?: Date;
  closedBy?: string;
  deliveredAt?: Date;
  deliveredBy?: string;
  returnedAt?: Date;
  returnedBy?: string;
  itemCount?: number;
  items?: VolumeItem[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface VolumeItem {
  id: string;
  volumeId: string;
  itemId: string;
  addedAt: Date;
  addedBy: string;
  item?: Item;
}

export interface CreateVolumeRequest {
  name?: string;
  serializedLabelCode?: string;
  destinationRef?: string;
  notes?: string;
}

export interface UpdateVolumeRequest {
  name?: string;
  destinationRef?: string;
  notes?: string;
}

export interface AddItemToVolumeRequest {
  itemId: string;
}

export interface VolumeActionRequest {
  notes?: string;
}

export interface VolumesResponse {
  volumes: Volume[];
  pagination?: PaginationMeta;
}

export interface VolumeResponse {
  volume: Volume;
}

export interface VolumeRomaneio {
  volume: Volume;
  items: Array<{
    item: Item;
    variant: Variant;
    product: Product;
  }>;
  generatedAt: Date;
}

export interface VolumesQuery extends PaginatedQuery {
  status?: VolumeStatus;
  search?: string;
}

// Serialized Label Types

export interface SerializedLabel {
  id: string;
  code: string;
  status: SerializedLabelStatus;
  linkedEntityType?: ScanEntityType;
  linkedEntityId?: string;
  printedAt?: Date;
  printedBy?: string;
  usedAt?: Date;
  usedBy?: string;
  voidedAt?: Date;
  voidedBy?: string;
  createdAt: Date;
}

export interface GenerateSerializedLabelsRequest {
  quantity: number;
  prefix?: string;
  startSequence?: number;
}

export interface LinkLabelRequest {
  entityType: ScanEntityType;
  entityId: string;
}

export interface SerializedLabelsResponse {
  labels: SerializedLabel[];
  pagination?: PaginationMeta;
}

export interface SerializedLabelResponse {
  label: SerializedLabel;
}

export interface LabelsQuery extends PaginatedQuery {
  status?: SerializedLabelStatus;
  search?: string;
}
