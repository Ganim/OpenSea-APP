// Coupon Types

import type { PaginatedQuery } from '../pagination';

export type CouponType = 'PERCENTAGE' | 'FIXED_VALUE' | 'FREE_SHIPPING';
export type CouponApplicableTo =
  | 'ALL'
  | 'SPECIFIC_PRODUCTS'
  | 'SPECIFIC_CATEGORIES'
  | 'SPECIFIC_CUSTOMERS';

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  PERCENTAGE: 'Percentual',
  FIXED_VALUE: 'Valor Fixo',
  FREE_SHIPPING: 'Frete Gratis',
};

export const COUPON_APPLICABLE_LABELS: Record<CouponApplicableTo, string> = {
  ALL: 'Todos',
  SPECIFIC_PRODUCTS: 'Produtos Especificos',
  SPECIFIC_CATEGORIES: 'Categorias Especificas',
  SPECIFIC_CUSTOMERS: 'Clientes Especificos',
};

export interface Coupon {
  id: string;
  tenantId: string;
  campaignId: string | null;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  maxUsageTotal: number | null;
  maxUsagePerCustomer: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableTo: CouponApplicableTo;
  targetIds: string[];
  aiGenerated: boolean;
  aiReason: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  campaignId?: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  maxUsageTotal?: number;
  maxUsagePerCustomer?: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
  applicableTo?: CouponApplicableTo;
  targetIds?: string[];
  customerId?: string;
}

export interface ValidateCouponRequest {
  code: string;
  orderValue?: number;
  variantIds?: string[];
}

export interface ValidateCouponResponse {
  result: {
    valid: boolean;
    coupon?: Coupon;
    reason?: string;
    discountAmount?: number;
  };
}

export interface CouponResponse {
  coupon: Coupon;
}

export interface PaginatedCouponsResponse {
  coupons: Coupon[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CouponsQuery extends PaginatedQuery {
  search?: string;
  type?: CouponType;
  isActive?: string;
  campaignId?: string;
}
