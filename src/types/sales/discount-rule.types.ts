// Discount Rule Types

import type { PaginatedQuery } from '../pagination';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  PERCENTAGE: 'Percentual',
  FIXED_AMOUNT: 'Valor Fixo',
};

export interface DiscountRule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  minOrderValue?: number;
  minQuantity?: number;
  categoryId?: string;
  productId?: string;
  customerId?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  isStackable: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDiscountRuleRequest {
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  minOrderValue?: number;
  minQuantity?: number;
  categoryId?: string;
  productId?: string;
  customerId?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  priority?: number;
  isStackable?: boolean;
}

export interface UpdateDiscountRuleRequest
  extends Partial<CreateDiscountRuleRequest> {}

export interface DiscountRulesQuery extends PaginatedQuery {
  type?: DiscountType;
  isActive?: boolean;
}
