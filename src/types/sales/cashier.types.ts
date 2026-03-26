// Cashier Types

import type { PaginatedQuery } from '../pagination';

export type CashierSessionStatus = 'OPEN' | 'CLOSED' | 'RECONCILED';
export type CashierTransactionType = 'SALE' | 'REFUND' | 'CASH_IN' | 'CASH_OUT';

export const CASHIER_SESSION_STATUS_LABELS: Record<
  CashierSessionStatus,
  string
> = {
  OPEN: 'Aberto',
  CLOSED: 'Fechado',
  RECONCILED: 'Conciliado',
};

export const CASHIER_TRANSACTION_TYPE_LABELS: Record<
  CashierTransactionType,
  string
> = {
  SALE: 'Venda',
  REFUND: 'Estorno',
  CASH_IN: 'Suprimento',
  CASH_OUT: 'Sangria',
};

export interface CashierTransaction {
  id: string;
  sessionId: string;
  type: CashierTransactionType;
  amount: number;
  description?: string;
  paymentMethod?: string;
  referenceId?: string;
  createdAt: string;
}

export interface CashierSession {
  id: string;
  tenantId: string;
  cashierId: string;
  posTerminalId?: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  status: CashierSessionStatus;
  notes?: string;
  createdAt: string;
  transactions?: CashierTransaction[];
}

export interface OpenCashierSessionRequest {
  posTerminalId?: string;
  openingBalance: number;
}

export interface CloseCashierSessionRequest {
  closingBalance: number;
  notes?: string;
}

export interface CreateCashierTransactionRequest {
  sessionId: string;
  type: CashierTransactionType;
  amount: number;
  description?: string;
  paymentMethod?: string;
  referenceId?: string;
}

export interface CashierSessionsQuery extends PaginatedQuery {
  status?: CashierSessionStatus;
  cashierId?: string;
}
