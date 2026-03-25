// Variant Promotion Types

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  PERCENTAGE: 'Percentual',
  FIXED: 'Valor Fixo',
};

export interface VariantPromotion {
  id: string;
  variantId: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrentlyValid: boolean;
  isExpired: boolean;
  isUpcoming: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVariantPromotionRequest {
  variantId: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateVariantPromotionRequest {
  name?: string;
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  notes?: string;
}

export interface VariantPromotionsResponse {
  promotions: VariantPromotion[];
}

export interface VariantPromotionResponse {
  promotion: VariantPromotion;
}
