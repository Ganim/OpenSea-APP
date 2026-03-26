export type BankConnectionStatus = 'ACTIVE' | 'EXPIRED' | 'ERROR' | 'REVOKED';

export interface BankConnection {
  id: string;
  bankAccountId: string;
  provider: string;
  status: BankConnectionStatus;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface ConnectTokenResponse {
  accessToken: string;
}

export interface SyncResult {
  transactionsImported: number;
  matchedCount: number;
  lastSyncAt: string | null;
}
