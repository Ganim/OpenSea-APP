export type FinanceCategoryType = 'EXPENSE' | 'REVENUE' | 'BOTH';

export interface FinanceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  color?: string | null;
  type: FinanceCategoryType;
  parentId?: string | null;
  parentName?: string;
  displayOrder: number;
  isActive: boolean;
  interestRate?: number | null;
  penaltyRate?: number | null;
  isSystem: boolean;
  childrenCount?: number;
  entryCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateFinanceCategoryData {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  type: FinanceCategoryType;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
  interestRate?: number;
  penaltyRate?: number;
}

export type UpdateFinanceCategoryData = Partial<CreateFinanceCategoryData>;

export interface FinanceCategoriesQuery {
  type?: FinanceCategoryType;
  isActive?: boolean;
  parentId?: string;
}

export const FINANCE_CATEGORY_TYPE_LABELS: Record<FinanceCategoryType, string> =
  {
    EXPENSE: 'Despesa',
    REVENUE: 'Receita',
    BOTH: 'Ambos',
  };
