export type PrintJobStatus =
  | 'CREATED'
  | 'QUEUED'
  | 'PRINTING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export interface PrintJobSummary {
  id: string;
  printerId: string;
  printerName: string | null;
  type: string;
  status: PrintJobStatus;
  copies: number;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

export interface PrintJobsResponse {
  jobs: PrintJobSummary[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface CreatePrintJobRequest {
  printerId: string;
  content: string;
  copies?: number;
  templateData?: Record<string, unknown>;
}

export interface CreatePrintJobResponse {
  jobId: string;
  status: 'queued';
}
