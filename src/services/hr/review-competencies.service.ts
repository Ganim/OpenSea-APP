/**
 * OpenSea OS - Review Competencies Service
 *
 * Cliente HTTP para o subrecurso ReviewCompetency aninhado em PerformanceReview.
 * Endpoints expostos pelo backend:
 *   - GET    /v1/hr/performance-reviews/:reviewId/competencies
 *   - POST   /v1/hr/performance-reviews/:reviewId/competencies
 *   - PATCH  /v1/hr/performance-reviews/:reviewId/competencies/:id
 *   - DELETE /v1/hr/performance-reviews/:reviewId/competencies/:id
 *   - POST   /v1/hr/performance-reviews/:reviewId/competencies/seed-defaults
 */

import { apiClient } from '@/lib/api-client';
import type {
  CreateReviewCompetencyData,
  ReviewCompetency,
  UpdateReviewCompetencyData,
} from '@/types/hr';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ReviewCompetenciesResponse {
  competencies: ReviewCompetency[];
}

export interface ReviewCompetencyResponse {
  competency: ReviewCompetency;
}

export interface SeedDefaultsResponse {
  competencies: ReviewCompetency[];
  created: number;
}

// ============================================================================
// SERVICE
// ============================================================================

class ReviewCompetenciesService {
  private buildBaseUrl(reviewId: string): string {
    return `/v1/hr/performance-reviews/${reviewId}/competencies`;
  }

  async listCompetencies(
    reviewId: string
  ): Promise<ReviewCompetenciesResponse> {
    return apiClient.get<ReviewCompetenciesResponse>(this.buildBaseUrl(reviewId));
  }

  async createCompetency(
    reviewId: string,
    payload: CreateReviewCompetencyData
  ): Promise<ReviewCompetencyResponse> {
    return apiClient.post<ReviewCompetencyResponse>(
      this.buildBaseUrl(reviewId),
      payload
    );
  }

  async updateCompetency(
    reviewId: string,
    competencyId: string,
    payload: UpdateReviewCompetencyData
  ): Promise<ReviewCompetencyResponse> {
    return apiClient.patch<ReviewCompetencyResponse>(
      `${this.buildBaseUrl(reviewId)}/${competencyId}`,
      payload
    );
  }

  async deleteCompetency(
    reviewId: string,
    competencyId: string
  ): Promise<void> {
    await apiClient.delete(`${this.buildBaseUrl(reviewId)}/${competencyId}`);
  }

  async seedDefaults(reviewId: string): Promise<SeedDefaultsResponse> {
    return apiClient.post<SeedDefaultsResponse>(
      `${this.buildBaseUrl(reviewId)}/seed-defaults`,
      {}
    );
  }
}

export const reviewCompetenciesService = new ReviewCompetenciesService();
