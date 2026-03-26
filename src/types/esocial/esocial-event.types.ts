export type EsocialEventStatus =
  | 'DRAFT'
  | 'REVIEWED'
  | 'APPROVED'
  | 'TRANSMITTING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ERROR';

export type EventStatusAction = 'review' | 'approve' | 'reject' | 'rectify';

export interface EsocialEvent {
  id: string;
  eventType: string;
  description: string;
  status: EsocialEventStatus;
  referenceId: string | null;
  referenceName: string | null;
  referenceType: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  deadline: string | null;
  xmlContent: string | null;
  signedXml: string | null;
  receipt: string | null;
  rejectionCode: string | null;
  rejectionMessage: string | null;
  retryCount: number;
  nextRetryAt: string | null;
  rectifiedEventId: string | null;
  batchId: string | null;
  createdBy: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EsocialEventListItem {
  id: string;
  eventType: string;
  description: string;
  status: EsocialEventStatus;
  referenceName: string | null;
  referenceType: string | null;
  deadline: string | null;
  receipt: string | null;
  rejectionCode: string | null;
  rejectionMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListEsocialEventsResponse {
  events: EsocialEventListItem[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    pages: number;
  };
}

export interface UpdateEventStatusResponse {
  event: {
    id: string;
    status: string;
  };
}

export interface BulkApproveResponse {
  approvedCount: number;
  skippedCount: number;
  errors: Array<{ id: string; reason: string }>;
}
