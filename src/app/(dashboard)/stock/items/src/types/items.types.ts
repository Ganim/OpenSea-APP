/**
 * Items Module Types
 * Tipos específicos para o módulo de items
 */

import type { Item, ItemStatus } from '@/types/stock';

/**
 * Dados do formulário de item
 */
export interface ItemFormData {
  uniqueCode: string;
  variantId: string;
  locationId: string;
  quantity: number;
  attributes?: Record<string, unknown>;
  batchNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  notes?: string;
}

/**
 * Props para o card de item (grid)
 */
export interface ItemGridCardProps {
  item: Item;
  isSelected: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onClick?: (id: string, event: React.MouseEvent) => void;
  onDoubleClick?: (id: string) => void;
}

/**
 * Props para o card de item (list)
 */
export interface ItemListCardProps {
  item: Item;
  isSelected: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onClick?: (id: string, event: React.MouseEvent) => void;
  onDoubleClick?: (id: string) => void;
}

/**
 * Contexto de seleção de items
 */
export interface ItemSelectionContext {
  selectedIds: Set<string>;
  isMultiSelect: boolean;
}

/**
 * Labels de status
 */
export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  DAMAGED: 'Danificado',
};
