/**
 * OKR Types (Objectives & Key Results)
 * Tipos para o módulo de OKRs do RH
 */

// ============================================================================
// ENUMS
// ============================================================================

export type ObjectiveLevel = 'COMPANY' | 'DEPARTMENT' | 'TEAM' | 'INDIVIDUAL';

export type ObjectiveStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type KeyResultType = 'NUMERIC' | 'PERCENTAGE' | 'CURRENCY' | 'BINARY';

export type KeyResultStatus = 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';

export type CheckInConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

// ============================================================================
// ENTITIES
// ============================================================================

export interface OKRObjective {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  parentId?: string | null;
  level: ObjectiveLevel;
  status: ObjectiveStatus;
  period: string;
  startDate: string;
  endDate: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  // Enriched data
  owner?: {
    id: string;
    fullName: string;
  } | null;
  parent?: {
    id: string;
    title: string;
  } | null;
  keyResults?: OKRKeyResult[];
  _count?: {
    keyResults?: number;
  };
}

export interface OKRKeyResult {
  id: string;
  objectiveId: string;
  title: string;
  description?: string | null;
  type: KeyResultType;
  startValue: number;
  targetValue: number;
  currentValue: number;
  unit?: string | null;
  status: KeyResultStatus;
  weight: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  // Enriched data
  checkIns?: OKRCheckIn[];
  _count?: {
    checkIns?: number;
  };
}

export interface OKRCheckIn {
  id: string;
  keyResultId: string;
  employeeId: string;
  previousValue: number;
  newValue: number;
  note?: string | null;
  confidence: CheckInConfidence;
  createdAt: string;
  // Enriched data
  employee?: {
    id: string;
    fullName: string;
  } | null;
}

// ============================================================================
// CREATE / UPDATE DTOs
// ============================================================================

export interface CreateObjectiveData {
  title: string;
  description?: string;
  ownerId: string;
  parentId?: string | null;
  level: ObjectiveLevel;
  period: string;
  startDate: string;
  endDate: string;
}

export interface UpdateObjectiveData {
  title?: string;
  description?: string;
  ownerId?: string;
  parentId?: string | null;
  level?: ObjectiveLevel;
  status?: ObjectiveStatus;
  period?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateKeyResultData {
  title: string;
  description?: string;
  type: KeyResultType;
  startValue?: number;
  targetValue: number;
  unit?: string;
  weight?: number;
}

export interface CreateCheckInData {
  newValue: number;
  note?: string;
  confidence: CheckInConfidence;
}
