export type DocumentType =
  | 'EDITAL'
  | 'LICITACAO'
  | 'PREGAO'
  | 'COTACAO'
  | 'OUTRO';

export interface DocumentMatchItem {
  description: string;
  quantity: number;
  unit: string;
  estimatedPrice: number | null;
  matchedProductId: string | null;
  matchedProductName: string | null;
  matchLevel: 'FULL' | 'PARTIAL' | 'NONE';
  matchScore: number;
}

export interface DocumentSuggestedAction {
  id: string;
  type: string;
  title: string;
  description: string;
  module: string;
  params: Record<string, unknown>;
}

export interface DocumentAnalysisResult {
  id: string;
  documentType: DocumentType;
  title: string;
  organization: string | null;
  publishDate: string | null;
  dueDate: string | null;
  estimatedValue: number | null;
  items: DocumentMatchItem[];
  matchPercentage: number;
  suggestedActions: DocumentSuggestedAction[];
  summary: string;
  rawAnalysis: Record<string, unknown>;
  createdAt: string;
}
