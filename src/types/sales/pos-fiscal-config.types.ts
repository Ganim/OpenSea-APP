// POS Fiscal Config (Emporion Fase 1)
// Tenant-wide configuration for fiscal document emission from POS sales.
// Singleton per tenant: there is no `:id` on the API endpoints — the row is
// keyed by the JWT-derived `tenantId`.

export type PosFiscalEmissionMode =
  | 'ONLINE_SYNC'
  | 'OFFLINE_CONTINGENCY'
  | 'NONE';

export type PosFiscalDocumentType = 'NFE' | 'NFC_E' | 'SAT_CFE' | 'MFE';

export interface PosFiscalConfig {
  id: string;
  tenantId: string;
  enabledDocumentTypes: PosFiscalDocumentType[];
  defaultDocumentType: PosFiscalDocumentType;
  emissionMode: PosFiscalEmissionMode;
  certificatePath: string | null;
  nfceSeries: number | null;
  nfceNextNumber: number | null;
  satDeviceId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdatePosFiscalConfigRequest {
  enabledDocumentTypes: PosFiscalDocumentType[];
  defaultDocumentType: PosFiscalDocumentType;
  emissionMode: PosFiscalEmissionMode;
  certificatePath?: string | null;
  nfceSeries?: number | null;
  nfceNextNumber?: number | null;
  satDeviceId?: string | null;
}

export interface GetPosFiscalConfigResponse {
  fiscalConfig: PosFiscalConfig | null;
}

export interface UpdatePosFiscalConfigResponse {
  fiscalConfig: PosFiscalConfig;
}
