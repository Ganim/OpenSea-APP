export type ContentType =
  | 'SOCIAL_POST'
  | 'PRODUCT_DESCRIPTION'
  | 'EMAIL_CAMPAIGN'
  | 'PROMOTION_BANNER';
export type ContentPlatform = 'INSTAGRAM' | 'WHATSAPP' | 'FACEBOOK' | 'EMAIL';
export type ContentTone = 'FORMAL' | 'CASUAL' | 'URGENTE' | 'LUXO';

export interface ContentGenerationRequest {
  contentType: ContentType;
  platform: ContentPlatform;
  productIds?: string[];
  categoryId?: string;
  theme?: string;
  tone: ContentTone;
  additionalContext?: string;
}

export interface ContentVariant {
  id: string;
  content: string;
  title: string | null;
  hashtags: string[];
  emoji: string[];
  characterCount: number;
}

export interface GeneratedContent {
  id: string;
  contentType: ContentType;
  platform: ContentPlatform;
  tone: ContentTone;
  variants: ContentVariant[];
  suggestions: string[];
  createdAt: string;
}

export interface CampaignSuggestion {
  id: string;
  insightId: string;
  title: string;
  description: string;
  targetProducts: { id: string; name: string; currentPrice: number }[];
  suggestedDiscount: number;
  estimatedImpact: {
    revenueIncrease: number;
    unitsSold: number;
    period: string;
  };
  status: 'PENDING' | 'APPLIED' | 'REJECTED';
  createdAt: string;
}
