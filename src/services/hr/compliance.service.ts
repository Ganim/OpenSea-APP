/**
 * OpenSea OS - HR Compliance Service (Phase 06)
 *
 * Thin client sobre os endpoints `/v1/hr/compliance/*` +
 * `/v1/esocial/config` introduzidos em Plans 06-02..06-06.
 */

import { apiClient } from '@/lib/api-client';
import type {
  BuildS1200Request,
  BuildS1200Response,
  ComplianceArtifactDownloadResponse,
  ComplianceArtifactsListResponse,
  EsocialConfigDto,
  GenerateAfdRequest,
  GenerateAfdtRequest,
  GenerateArtifactResponse,
  GenerateFolhaEspelhoBulkRequest,
  GenerateFolhaEspelhoBulkResponse,
  GenerateFolhaEspelhoRequest,
  ListComplianceArtifactsParams,
  ListRubricaMapResponse,
  UpdateEsocialConfigRequest,
  UpsertRubricaMapRequest,
} from '@/types/hr';

export const complianceService = {
  /**
   * GET /v1/hr/compliance/artifacts — listagem paginada (infinite scroll).
   * Requires `hr.compliance.access`.
   */
  async listArtifacts(
    params: ListComplianceArtifactsParams
  ): Promise<ComplianceArtifactsListResponse> {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    if (params.type) query.type = params.type;
    if (params.competencia) query.competencia = params.competencia;
    if (params.periodStart) query.periodStart = params.periodStart;
    if (params.periodEnd) query.periodEnd = params.periodEnd;
    if (params.employeeId) query.employeeId = params.employeeId;
    if (params.search) query.search = params.search;

    return apiClient.get<ComplianceArtifactsListResponse>(
      '/v1/hr/compliance/artifacts',
      { params: query }
    );
  },

  /**
   * GET /v1/hr/compliance/artifacts/:id/download — retorna presigned URL
   * (15 min TTL) + expiresAt ISO. Frontend abre via `window.open(url)`.
   * Requires `hr.compliance.artifact.download`.
   */
  async getDownloadUrl(
    id: string
  ): Promise<ComplianceArtifactDownloadResponse> {
    return apiClient.get<ComplianceArtifactDownloadResponse>(
      `/v1/hr/compliance/artifacts/${id}/download`
    );
  },

  /**
   * POST /v1/hr/compliance/afd — gera artefato AFD (byte-a-byte Portaria 671).
   * Requires `hr.compliance.afd.generate`.
   */
  async generateAfd(
    body: GenerateAfdRequest
  ): Promise<GenerateArtifactResponse> {
    return apiClient.post<GenerateArtifactResponse>(
      '/v1/hr/compliance/afd',
      body
    );
  },

  /**
   * POST /v1/hr/compliance/afdt — AFDT proprietário (inclui ajustes aprovados).
   * Requires `hr.compliance.afdt.generate`.
   */
  async generateAfdt(
    body: GenerateAfdtRequest
  ): Promise<GenerateArtifactResponse> {
    return apiClient.post<GenerateArtifactResponse>(
      '/v1/hr/compliance/afdt',
      body
    );
  },

  /**
   * POST /v1/hr/compliance/folhas-espelho — individual síncrona.
   * Requires `hr.compliance.folha-espelho.generate`.
   */
  async generateFolhaEspelho(
    body: GenerateFolhaEspelhoRequest
  ): Promise<GenerateArtifactResponse> {
    return apiClient.post<GenerateArtifactResponse>(
      '/v1/hr/compliance/folhas-espelho',
      body
    );
  },

  /**
   * POST /v1/hr/compliance/folhas-espelho/bulk — dispara BullMQ bulk job.
   * Progress via Socket.IO (ver `useComplianceBulkProgress`).
   * Requires `hr.compliance.folha-espelho.generate`.
   */
  async generateFolhaEspelhoBulk(
    body: GenerateFolhaEspelhoBulkRequest
  ): Promise<GenerateFolhaEspelhoBulkResponse> {
    return apiClient.post<GenerateFolhaEspelhoBulkResponse>(
      '/v1/hr/compliance/folhas-espelho/bulk',
      body
    );
  },

  /**
   * POST /v1/hr/compliance/esocial-s1200 — gera eventos S-1200 por competência.
   * Requires `hr.compliance.s1200.submit` + PIN (client-side gate).
   */
  async buildS1200(body: BuildS1200Request): Promise<BuildS1200Response> {
    return apiClient.post<BuildS1200Response>(
      '/v1/hr/compliance/esocial-s1200',
      body
    );
  },

  /**
   * GET /v1/hr/compliance/esocial-rubricas — lista mapeamentos + gaps
   * obrigatórios (HE_50, HE_100, DSR).
   * Requires `hr.compliance.access`.
   */
  async listRubricaMap(): Promise<ListRubricaMapResponse> {
    return apiClient.get<ListRubricaMapResponse>(
      '/v1/hr/compliance/esocial-rubricas'
    );
  },

  /**
   * PUT /v1/hr/compliance/esocial-rubricas/:concept — upsert de mapa por conceito.
   * Requires `hr.compliance.config.modify`.
   */
  async upsertRubricaMap(
    concept: string,
    body: UpsertRubricaMapRequest
  ): Promise<{ item: unknown; created: boolean }> {
    return apiClient.put<{ item: unknown; created: boolean }>(
      `/v1/hr/compliance/esocial-rubricas/${concept}`,
      body
    );
  },

  /**
   * GET /v1/esocial/config — config atual (inclui `inpiNumber`).
   * Requires `esocial.config.access`.
   */
  async getEsocialConfig(): Promise<{ config: EsocialConfigDto }> {
    return apiClient.get<{ config: EsocialConfigDto }>('/v1/esocial/config');
  },

  /**
   * PATCH /v1/esocial/config — atualiza config (inclui `inpiNumber`).
   * Requires `esocial.config.admin`.
   */
  async updateEsocialConfig(
    body: UpdateEsocialConfigRequest
  ): Promise<{ config: EsocialConfigDto }> {
    return apiClient.patch<{ config: EsocialConfigDto }>(
      '/v1/esocial/config',
      body
    );
  },
};
