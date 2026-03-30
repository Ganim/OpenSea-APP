/**
 * PPE (EPI) Types
 */

export type PPECategory =
  | 'HEAD'
  | 'EYES'
  | 'EARS'
  | 'RESPIRATORY'
  | 'HANDS'
  | 'FEET'
  | 'BODY'
  | 'FALL_PROTECTION';

export type PPECondition = 'NEW' | 'GOOD' | 'WORN' | 'DAMAGED';

export type PPEAssignmentStatus = 'ACTIVE' | 'RETURNED' | 'EXPIRED' | 'LOST';

export interface PPEItem {
  id: string;
  name: string;
  category: PPECategory;
  caNumber: string | null;
  manufacturer: string | null;
  model: string | null;
  expirationMonths: number | null;
  minStock: number;
  currentStock: number;
  isActive: boolean;
  isLowStock: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PPEAssignment {
  id: string;
  ppeItemId: string;
  employeeId: string;
  assignedAt: string;
  returnedAt: string | null;
  expiresAt: string | null;
  condition: PPECondition;
  returnCondition: string | null;
  quantity: number;
  notes: string | null;
  status: PPEAssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePPEItemData {
  name: string;
  category: PPECategory;
  caNumber?: string;
  manufacturer?: string;
  model?: string;
  expirationMonths?: number;
  minStock?: number;
  currentStock?: number;
  isActive?: boolean;
  notes?: string;
}

export interface UpdatePPEItemData {
  name?: string;
  category?: PPECategory;
  caNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  expirationMonths?: number | null;
  minStock?: number;
  isActive?: boolean;
  notes?: string | null;
}

export interface AdjustPPEItemStockData {
  adjustment: number;
}

export interface AssignPPEData {
  ppeItemId: string;
  employeeId: string;
  expiresAt?: string;
  condition?: PPECondition;
  quantity: number;
  notes?: string;
}

export interface ReturnPPEData {
  returnCondition: PPECondition;
  notes?: string;
}
