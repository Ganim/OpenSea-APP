// ─── Payment Timing (Smart Payment Optimization) ────────────────────────────

export interface PaymentTimingSuggestion {
  entryId: string;
  supplierName: string;
  amount: number;
  currentDueDate: string;
  suggestedPayDate: string;
  reason: string;
  savingsAmount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'EARLY_DISCOUNT' | 'DELAY_SAFE' | 'PENALTY_RISK';
}

export interface PaymentTimingResponse {
  suggestions: PaymentTimingSuggestion[];
  totalPotentialSavings: number;
  analyzedEntries: number;
}

// ─── Exchange Rate ───────────────────────────────────────────────────────────

export interface ExchangeRateResponse {
  currency: string;
  rate: number;
  date: string;
  source: string;
}

// ─── Three-Way Match ─────────────────────────────────────────────────────────

export interface ThreeWayMatchResponse {
  entryId: string;
  matchStatus: 'FULL_MATCH' | 'PARTIAL_MATCH' | 'NO_MATCH';
  invoice?: {
    id: string;
    number: string;
    amount: number;
    date: string;
  };
  purchaseOrder?: {
    id: string;
    code: string;
    amount: number;
    date: string;
  };
  goodsReceipt?: {
    id: string;
    code: string;
    items: number;
    date: string;
  };
  discrepancies: Array<{
    field: string;
    expected: string;
    actual: string;
    tolerance: string;
  }>;
  recommendation: string;
}
