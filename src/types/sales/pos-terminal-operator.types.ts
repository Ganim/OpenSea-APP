// POS Terminal Operator (Emporion Fase 1)
// Authorizes Employees to operate sales on a specific POS Terminal using their
// `shortId`. The link can be active or revoked (audit trail).

export interface PosTerminalOperator {
  id: string;
  terminalId: string;
  employeeId: string;
  tenantId: string;
  isActive: boolean;
  assignedAt: string;
  assignedByUserId: string;
  revokedAt: string | null;
  revokedByUserId: string | null;
}

/**
 * Row returned by the list endpoint, enriched with the Employee's `fullName`
 * and `shortId` so the UI can render without an extra round-trip.
 */
export interface PosTerminalOperatorEnriched {
  operatorId: string;
  employeeId: string;
  employeeName: string;
  employeeShortId: string;
  assignedAt: string;
  assignedByUserId: string;
  isActive: boolean;
  revokedAt: string | null;
}

export interface AssignTerminalOperatorRequest {
  employeeId: string;
}

export interface AssignTerminalOperatorResponse {
  operator: PosTerminalOperator;
}

export interface ListTerminalOperatorsResponse {
  data: PosTerminalOperatorEnriched[];
  meta: { total: number; page: number; limit: number; pages: number };
}
