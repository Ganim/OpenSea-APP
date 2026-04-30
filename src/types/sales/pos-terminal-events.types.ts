// POS Terminal realtime events (admin /admin/pos namespace)

export interface TerminalSyncedEvent {
  terminalId: string;
  lastCatalogSyncAt: string;
  pendingSales: number;
  conflictSales: number;
}

export type TerminalUnpairReason =
  | 'admin-revoked'
  | 'self-reset'
  | 'force-revoked';

export interface TerminalUnpairedEvent {
  terminalId: string;
  terminalName: string;
  reason: TerminalUnpairReason;
}

export interface TerminalPairedEvent {
  terminalId: string;
  terminalName: string;
}
