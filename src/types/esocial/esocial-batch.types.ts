export type EsocialBatchStatus =
  | 'PENDING'
  | 'TRANSMITTING'
  | 'TRANSMITTED'
  | 'PARTIALLY_ACCEPTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ERROR';

export interface EsocialBatch {
  id: string;
  protocol: string | null;
  status: EsocialBatchStatus;
  environment: string;
  totalEvents: number;
  acceptedCount: number;
  rejectedCount: number;
  transmittedAt: string | null;
  checkedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  nextRetryAt: string | null;
  createdBy: string | null;
  createdAt: string;
  events: Array<{
    id: string;
    eventType: string;
    description: string;
    status: string;
    referenceName: string | null;
    receipt: string | null;
    rejectionCode: string | null;
    rejectionMessage: string | null;
  }>;
}

export interface EsocialBatchListItem {
  id: string;
  protocol: string | null;
  status: EsocialBatchStatus;
  environment: string;
  totalEvents: number;
  acceptedCount: number;
  rejectedCount: number;
  transmittedAt: string | null;
  checkedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface ListEsocialBatchesResponse {
  batches: EsocialBatchListItem[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    pages: number;
  };
}

export interface TransmitBatchResponse {
  batchId: string;
  protocol?: string;
  eventCount: number;
  status: string;
}
