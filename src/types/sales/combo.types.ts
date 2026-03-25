// Combo Types

import type { PaginatedQuery } from '../pagination';

export type ComboType = 'FIXED' | 'DYNAMIC';
export type ComboDiscountType = 'PERCENTAGE' | 'FIXED_VALUE';

export const COMBO_TYPE_LABELS: Record<ComboType, string> = {
  FIXED: 'Preco Fixo',
  DYNAMIC: 'Dinamico',
};

export interface Combo {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  type: ComboType;
  fixedPrice: number | null;
  discountType: ComboDiscountType | null;
  discountValue: number | null;
  minItems: number | null;
  maxItems: number | null;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateComboRequest {
  name: string;
  description?: string;
  type?: ComboType;
  fixedPrice?: number;
  discountType?: ComboDiscountType;
  discountValue?: number;
  minItems?: number;
  maxItems?: number;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  imageUrl?: string;
  items?: Array<{
    variantId?: string;
    categoryId?: string;
    quantity?: number;
    isRequired?: boolean;
    position?: number;
  }>;
}

export interface ComboItem {
  id?: string;
  variantId?: string;
  categoryId?: string;
  quantity: number;
  isRequired: boolean;
  position: number;
}

export interface UpdateComboRequest {
  name?: string;
  description?: string | null;
  type?: ComboType;
  fixedPrice?: number | null;
  discountType?: ComboDiscountType | null;
  discountValue?: number | null;
  minItems?: number | null;
  maxItems?: number | null;
  isActive?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
  imageUrl?: string | null;
  items?: Array<{
    variantId?: string;
    categoryId?: string;
    quantity?: number;
    isRequired?: boolean;
    position?: number;
  }>;
}

export interface ComboResponse {
  combo: Combo;
}

export interface PaginatedCombosResponse {
  combos: Combo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CombosQuery extends PaginatedQuery {
  search?: string;
  type?: ComboType;
  isActive?: string;
}
