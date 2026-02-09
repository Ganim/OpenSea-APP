export interface FinanceDashboard {
  totalPayable: number;
  totalReceivable: number;
  overduePayable: number;
  overdueReceivable: number;
  overduePayableCount: number;
  overdueReceivableCount: number;
  paidThisMonth: number;
  receivedThisMonth: number;
  upcomingPayable7Days: number;
  upcomingReceivable7Days: number;
  cashBalance: number;
  topOverdueReceivables: OverdueReceivableSummary[];
  topOverduePayables: OverduePayableSummary[];
}

export interface OverdueReceivableSummary {
  customerName: string;
  totalOverdue: number;
  count: number;
  oldestDueDate: string;
}

export interface OverduePayableSummary {
  supplierName: string;
  totalOverdue: number;
  count: number;
  oldestDueDate: string;
}

export interface CashflowData {
  period: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeBalance: number;
}

export interface CashflowResponse {
  data: CashflowData[];
  summary: {
    totalInflow: number;
    totalOutflow: number;
    netFlow: number;
    openingBalance: number;
    closingBalance: number;
  };
}
