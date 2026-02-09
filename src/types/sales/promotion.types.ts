// Variant Promotion Types

export interface VariantPromotion {
  id: string;
  variantId: string;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateVariantPromotionRequest {
  variantId: string;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateVariantPromotionRequest {
  discountType?: string;
  discountValue?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  notes?: string;
}

export interface VariantPromotionsResponse {
  promotions: VariantPromotion[];
}

export interface VariantPromotionResponse {
  promotion: VariantPromotion;
}
