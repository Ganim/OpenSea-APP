export type JournalSourceType = 'FINANCE_ENTRY' | 'FINANCE_PAYMENT' | 'MANUAL';
export type JournalStatus = 'POSTED' | 'REVERSED';
export type EntryLineType = 'DEBIT' | 'CREDIT';

export interface JournalEntryLine {
  id: string;
  chartOfAccountId: string;
  chartOfAccountCode?: string;
  chartOfAccountName?: string;
  type: EntryLineType;
  amount: number;
  description: string | null;
}

export interface JournalEntry {
  id: string;
  code: string;
  date: string;
  description: string;
  sourceType: JournalSourceType;
  sourceId: string | null;
  status: JournalStatus;
  reversedById: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  lines: JournalEntryLine[];
}

export interface JournalEntriesQuery {
  page?: number;
  limit?: number;
  chartOfAccountId?: string;
  sourceType?: JournalSourceType;
  dateFrom?: string;
  dateTo?: string;
}

export interface JournalEntriesResponse {
  data: JournalEntry[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface JournalEntryResponse {
  journalEntry: JournalEntry;
}

export interface CreateJournalEntryData {
  date: string;
  description: string;
  sourceType?: JournalSourceType;
  sourceId?: string;
  lines: Array<{
    chartOfAccountId: string;
    type: EntryLineType;
    amount: number;
    description?: string;
  }>;
}

export interface LedgerEntry {
  date: string;
  journalEntryId: string;
  journalCode: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  sourceType: JournalSourceType;
  sourceId: string | null;
}

export interface LedgerResponse {
  account: {
    id: string;
    code: string;
    name: string;
    type: string;
    nature: string;
  };
  period: { from: string; to: string };
  openingBalance: number;
  entries: LedgerEntry[];
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
}

export interface TrialBalanceAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  nature: string;
  level: number;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

export interface TrialBalanceResponse {
  period: { from: string; to: string };
  accounts: TrialBalanceAccount[];
  totals: { debit: number; credit: number };
}
