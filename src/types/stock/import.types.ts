// Import Types

export type ImportStatus =
  | 'VALIDATING'
  | 'VALIDATED'
  | 'IMPORTING'
  | 'COMPLETED'
  | 'FAILED';

export interface ImportValidationRequest {
  type: 'PRODUCTS' | 'VARIANTS' | 'ITEMS';
  data: Record<string, unknown>[];
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: unknown;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  preview?: Record<string, unknown>[];
}

export interface ImportRequest {
  type: 'PRODUCTS' | 'VARIANTS' | 'ITEMS';
  data: Record<string, unknown>[];
  options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    dryRun?: boolean;
  };
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
  createdIds?: string[];
}

export interface ImportTemplateResponse {
  headers: string[];
  requiredFields: string[];
  optionalFields: string[];
  sampleData: Record<string, unknown>[];
  instructions: string;
}
