// ============================================================================
// Approval Delegation Types
// ============================================================================

export type DelegationScope =
  | 'ALL'
  | 'ABSENCES'
  | 'VACATIONS'
  | 'OVERTIME'
  | 'REQUESTS';

export interface ApprovalDelegation {
  id: string;
  tenantId: string;
  delegatorId: string;
  delegateId: string;
  scope: DelegationScope;
  startDate: string;
  endDate: string | null;
  reason: string | null;
  isActive: boolean;
  isEffective: boolean;
  createdAt: string;
  updatedAt: string;
  delegatorName?: string;
  delegateName?: string;
}

export interface ApprovalDelegationsResponse {
  delegations: ApprovalDelegation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ActiveDelegationsResponse {
  delegations: ApprovalDelegation[];
}

export interface CreateDelegationData {
  delegateId: string;
  scope: DelegationScope;
  startDate: string;
  endDate?: string;
  reason?: string;
}

export interface CreateDelegationResponse {
  delegation: ApprovalDelegation;
}

export interface RevokeDelegationResponse {
  delegation: ApprovalDelegation;
}
