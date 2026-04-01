/**
 * OpenSea OS - HR Report Types
 * Tipos para relatórios e exportações do módulo de RH
 */

// =============================================================================
// CSV EXPORT PARAMS
// =============================================================================

export interface ExportEmployeesParams {
  status?: string;
  departmentId?: string;
  positionId?: string;
  companyId?: string;
}

export interface ExportAbsencesParams {
  startDate: string;
  endDate: string;
  employeeId?: string;
  type?: string;
  status?: string;
}

export interface ExportPayrollParams {
  referenceMonth: number;
  referenceYear: number;
}

// =============================================================================
// COMPLIANCE REPORT PARAMS
// =============================================================================

export interface RaisReportParams {
  year: number;
}

export interface DirfReportParams {
  year: number;
}

export interface SefipReportParams {
  year: number;
  month: number;
}

export interface CagedReportParams {
  year: number;
  month: number;
}

// =============================================================================
// COMPLIANCE REPORT RESPONSES
// =============================================================================

export interface ComplianceReportResponse {
  success: boolean;
  message: string;
  filename?: string;
  recordCount?: number;
}
