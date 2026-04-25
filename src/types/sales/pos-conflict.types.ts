// POS Order Conflict (Emporion Fase 1)
// Captures situations where a sale created at the POS desktop client cannot be
// applied as-is on the central server (insufficient stock, fractional rules,
// missing item). Each conflict has automatic and manual resolution paths.

export type PosOrderConflictStatus =
  | 'PENDING_RESOLUTION'
  | 'AUTO_SUBSTITUTED'
  | 'AUTO_ADJUSTED'
  | 'CANCELED_REFUNDED'
  | 'FORCED_ADJUSTMENT'
  | 'ITEM_SUBSTITUTED_MANUAL'
  | 'EXPIRED';

export type PosOrderConflictReason =
  | 'INSUFFICIENT_STOCK'
  | 'FRACTIONAL_NOT_ALLOWED'
  | 'BELOW_MIN_FRACTIONAL_SALE'
  | 'ITEM_NOT_FOUND';

export interface ConflictDetail {
  itemId: string;
  variantId: string;
  requestedQuantity: number;
  availableQuantity: number;
  shortage: number;
  reason: PosOrderConflictReason;
}

export interface PosOrderConflict {
  id: string;
  tenantId: string;
  saleLocalUuid: string;
  orderId: string | null;
  posTerminalId: string;
  posSessionId: string | null;
  posOperatorEmployeeId: string | null;
  status: PosOrderConflictStatus;
  conflictDetails: ConflictDetail[];
  resolutionDetails: Record<string, unknown> | null;
  resolvedByUserId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Conflict enriched with the terminal name and operator identification, used
 * by the admin "Conflitos" panel.
 */
export interface PosOrderConflictEnriched {
  id: string;
  saleLocalUuid: string;
  status: PosOrderConflictStatus;
  posTerminalId: string;
  terminalName: string;
  posSessionId: string | null;
  posOperatorEmployeeId: string | null;
  operatorName: string;
  operatorShortId: string;
  conflictDetails: ConflictDetail[];
  resolvedByUserId: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export type ResolveConflictAction =
  | 'CANCEL_AND_REFUND'
  | 'FORCE_ADJUSTMENT'
  | 'SUBSTITUTE_ITEM';

export interface ResolveConflictRequest {
  action: ResolveConflictAction;
  notes?: string;
  substituteItemIds?: string[];
}

export interface ListConflictsParams {
  page?: number;
  limit?: number;
  status?: PosOrderConflictStatus | PosOrderConflictStatus[];
  terminalId?: string;
  operatorEmployeeId?: string;
}

export interface ListConflictsResponse {
  data: PosOrderConflictEnriched[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface ResolveConflictResponse {
  conflict: PosOrderConflict;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    grandTotal: number;
    paidAmount: number;
    cancelledAt: string | null;
    cancelReason: string | null;
  };
}
