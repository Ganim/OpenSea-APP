/**
 * OpenSea OS - Review Competency Types
 *
 * Tipos para competencias avaliadas em uma performance review.
 * Cada review possui N competencias com peso, nota self e nota manager.
 */

// ============================================================================
// REVIEW COMPETENCY ENTITY
// ============================================================================

/**
 * Competencia avaliada dentro de uma performance review.
 * Cada competencia tem uma nota de auto-avaliacao (0-5), uma nota do gestor (0-5)
 * e um peso (multiplicador) para calculo da media ponderada.
 */
export interface ReviewCompetency {
  id: string;
  reviewId: string;
  name: string;
  weight: number;
  selfScore: number | null;
  managerScore: number | null;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// REQUEST PAYLOADS
// ============================================================================

export interface CreateReviewCompetencyData {
  name: string;
  weight?: number;
}

export interface UpdateReviewCompetencyData {
  name?: string;
  weight?: number;
  selfScore?: number | null;
  managerScore?: number | null;
  comments?: string | null;
}

// ============================================================================
// AGGREGATED REVIEW (review + competencies + computed scores)
// ============================================================================

/**
 * Resposta do endpoint GET /v1/hr/performance-reviews/:id quando inclui
 * competencies e scores agregados (media ponderada calculada no backend).
 */
export interface PerformanceReviewWithCompetencies {
  reviewId: string;
  aggregatedSelfScore: number | null;
  aggregatedManagerScore: number | null;
  competencies: ReviewCompetency[];
}

// ============================================================================
// RADAR CHART DATA POINT
// ============================================================================

/**
 * Estrutura usada pelo RadarChart para exibir comparativo self vs manager.
 */
export interface CompetencyRadarPoint {
  name: string;
  selfScore: number;
  managerScore: number;
}
