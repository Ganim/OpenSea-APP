/**
 * OpenSea OS - HR Compliance Types (Phase 06)
 *
 * Types espelhando os Zod schemas do backend (Plans 06-02..06-06) para o
 * dashboard /hr/compliance.
 *
 * Dates: ISO string (JSON returns string — ver CLAUDE.md APP §Types §6).
 */

export type ComplianceArtifactType =
  | 'AFD'
  | 'AFDT'
  | 'FOLHA_ESPELHO'
  | 'RECIBO'
  | 'S1200_XML';

export interface ComplianceArtifactDto {
  id: string;
  tenantId: string;
  type: ComplianceArtifactType;
  periodStart: string | null;
  periodEnd: string | null;
  competencia: string | null;
  filters: Record<string, unknown> | null;
  storageKey: string;
  contentHash: string;
  sizeBytes: number;
  generatedBy: string;
  generatedAt: string;
}

export interface ComplianceArtifactsListResponse {
  items: ComplianceArtifactDto[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface ListComplianceArtifactsParams {
  page?: number;
  limit?: number;
  type?: ComplianceArtifactType;
  competencia?: string;
  periodStart?: string;
  periodEnd?: string;
  employeeId?: string;
  search?: string;
}

export interface ComplianceArtifactDownloadResponse {
  url: string;
  expiresAt: string;
}

/* ========================================================================== */
/* AFD / AFDT generation                                                      */
/* ========================================================================== */

export interface GenerateAfdRequest {
  startDate: string;
  endDate: string;
  cnpj?: string;
  departmentIds?: string[];
  employeeId?: string;
}

export interface GenerateArtifactResponse {
  artifactId: string;
  downloadUrl: string;
  storageKey: string;
  sizeBytes: number;
  contentHash: string;
}

export type GenerateAfdtRequest = GenerateAfdRequest;

/* ========================================================================== */
/* Folha Espelho                                                              */
/* ========================================================================== */

export interface GenerateFolhaEspelhoRequest {
  employeeId: string;
  competencia: string;
}

export type FolhaEspelhoScope = 'ALL' | 'DEPARTMENT' | 'CUSTOM';

export interface GenerateFolhaEspelhoBulkRequest {
  competencia: string;
  scope: FolhaEspelhoScope;
  employeeIds?: string[];
  departmentIds?: string[];
}

export interface GenerateFolhaEspelhoBulkResponse {
  bulkJobId: string;
  employeeCount: number;
}

/* ========================================================================== */
/* S-1200                                                                     */
/* ========================================================================== */

export type S1200Scope = 'ALL' | 'DEPARTMENT' | 'CUSTOM';

export interface BuildS1200Request {
  competencia: string;
  scope: S1200Scope;
  employeeIds?: string[];
  departmentIds?: string[];
  retify?: {
    originalReceiptNumber: string;
    originalEsocialEventId: string;
  };
  transmitImmediately?: boolean;
}

export interface BuildS1200Response {
  batchId: string;
  environment: 'HOMOLOGACAO' | 'PRODUCAO';
  eventIds: string[];
  artifactIds: string[];
  errors: Array<{ employeeId: string; reason: string }>;
  touched?: string[];
}

/* ========================================================================== */
/* Rubrica Map                                                                */
/* ========================================================================== */

export type ComplianceRubricaConcept =
  | 'HE_50'
  | 'HE_100'
  | 'DSR'
  | 'FERIAS'
  | 'FALTA_JUSTIFICADA'
  | 'SALARIO_BASE';

export interface ComplianceRubricaMapDto {
  id: string;
  tenantId: string;
  clrConcept: ComplianceRubricaConcept;
  codRubr: string;
  ideTabRubr: string;
  indApurIR: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListRubricaMapResponse {
  items: ComplianceRubricaMapDto[];
  gaps: ComplianceRubricaConcept[];
}

export interface UpsertRubricaMapRequest {
  codRubr: string;
  ideTabRubr: string;
  indApurIR?: number;
}

/* ========================================================================== */
/* eSocial Config                                                             */
/* ========================================================================== */

export interface EsocialConfigDto {
  id: string;
  tenantId: string;
  environment: 'HOMOLOGACAO' | 'PRODUCAO';
  version: string;
  tpInsc: number;
  nrInsc: string | null;
  inpiNumber: string | null;
  autoGenerateOnAdmission: boolean;
  autoGenerateOnTermination: boolean;
  autoGenerateOnLeave: boolean;
  autoGenerateOnPayroll: boolean;
  requireApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEsocialConfigRequest {
  environment?: 'HOMOLOGACAO' | 'PRODUCAO';
  tpInsc?: number;
  nrInsc?: string | null;
  inpiNumber?: string | null;
  requireApproval?: boolean;
}

/* ========================================================================== */
/* Socket.IO — bulk progress                                                  */
/* ========================================================================== */

export interface ComplianceBulkProgressEvent {
  bulkJobId: string;
  total: number;
  success: number;
  failed: number;
  status: 'running' | 'completed';
}
