/**
 * OpenSea OS - HR Reports Service
 * Serviço para exportação de relatórios e obrigações legais do RH
 */

import { apiConfig } from '@/config/api';
import type {
  ExportEmployeesParams,
  ExportAbsencesParams,
  ExportPayrollParams,
  RaisReportParams,
  DirfReportParams,
  SefipReportParams,
  CagedReportParams,
  ComplianceReportResponse,
} from '@/types/hr';

// =============================================================================
// HELPERS
// =============================================================================

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(endpoint, apiConfig.baseURL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    }
  }
  return url.toString();
}

async function downloadCsv(
  endpoint: string,
  params?: Record<string, string>,
  defaultFilename = 'export.csv'
): Promise<void> {
  const token = getAuthToken();
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Erro ao exportar relatório' }));
    throw new Error(errorData.message || `Erro HTTP ${response.status}`);
  }

  const disposition = response.headers.get('Content-Disposition');
  let filename = defaultFilename;
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]*)["']?/);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

async function postReport<T>(
  endpoint: string,
  data: Record<string, unknown>
): Promise<T> {
  const token = getAuthToken();
  const url = buildUrl(endpoint);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Erro ao gerar relatório' }));
    throw new Error(errorData.message || `Erro HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// =============================================================================
// SERVICE
// =============================================================================

export const hrReportsService = {
  /**
   * Exportar lista de funcionários em CSV
   */
  async exportEmployees(params?: ExportEmployeesParams): Promise<void> {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.departmentId) queryParams.departmentId = params.departmentId;
    if (params?.positionId) queryParams.positionId = params.positionId;
    if (params?.companyId) queryParams.companyId = params.companyId;

    await downloadCsv(
      '/v1/hr/reports/employees',
      queryParams,
      'funcionarios.csv'
    );
  },

  /**
   * Exportar registro de ausências em CSV
   */
  async exportAbsences(params: ExportAbsencesParams): Promise<void> {
    const queryParams: Record<string, string> = {
      startDate: params.startDate,
      endDate: params.endDate,
    };
    if (params.employeeId) queryParams.employeeId = params.employeeId;
    if (params.type) queryParams.type = params.type;
    if (params.status) queryParams.status = params.status;

    await downloadCsv('/v1/hr/reports/absences', queryParams, 'ausencias.csv');
  },

  /**
   * Exportar folha de pagamento em CSV
   */
  async exportPayroll(params: ExportPayrollParams): Promise<void> {
    const queryParams: Record<string, string> = {
      referenceMonth: String(params.referenceMonth),
      referenceYear: String(params.referenceYear),
    };

    await downloadCsv(
      '/v1/hr/reports/payroll',
      queryParams,
      'folha-pagamento.csv'
    );
  },

  /**
   * Gerar relatório RAIS
   */
  async generateRais(
    params: RaisReportParams
  ): Promise<ComplianceReportResponse> {
    return postReport<ComplianceReportResponse>('/v1/hr/reports/rais', {
      year: params.year,
    });
  },

  /**
   * Gerar relatório DIRF
   */
  async generateDirf(
    params: DirfReportParams
  ): Promise<ComplianceReportResponse> {
    return postReport<ComplianceReportResponse>('/v1/hr/reports/dirf', {
      year: params.year,
    });
  },

  /**
   * Gerar relatório SEFIP
   */
  async generateSefip(
    params: SefipReportParams
  ): Promise<ComplianceReportResponse> {
    return postReport<ComplianceReportResponse>('/v1/hr/reports/sefip', {
      year: params.year,
      month: params.month,
    });
  },

  /**
   * Gerar relatório CAGED
   */
  async generateCaged(
    params: CagedReportParams
  ): Promise<ComplianceReportResponse> {
    return postReport<ComplianceReportResponse>('/v1/hr/reports/caged', {
      year: params.year,
      month: params.month,
    });
  },
};
