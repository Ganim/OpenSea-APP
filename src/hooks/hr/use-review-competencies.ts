/**
 * OpenSea OS - Hooks for Review Competencies
 *
 * React Query hooks para o subrecurso ReviewCompetency. Centraliza queryKeys,
 * mutations com invalidacao e mensagens em PT formal.
 */

'use client';

import { reviewsService } from '@/services/hr/reviews.service';
import { reviewCompetenciesService } from '@/services/hr/review-competencies.service';
import type {
  CreateReviewCompetencyData,
  UpdateReviewCompetencyData,
} from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const reviewCompetencyKeys = {
  all: ['review-competencies'] as const,
  byReview: (reviewId: string) =>
    [...reviewCompetencyKeys.all, reviewId] as const,
};

export const performanceReviewKeys = {
  all: ['performance-reviews'] as const,
  detail: (reviewId: string) =>
    [...performanceReviewKeys.all, 'detail', reviewId] as const,
  byCycle: (cycleId: string) =>
    [...performanceReviewKeys.all, 'by-cycle', cycleId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Carrega a performance review com competencias e scores agregados.
 * Os scores agregados (selfScore/managerScore ponderados pelas competencias)
 * vem calculados pelo backend.
 */
export function useReviewWithCompetencies(reviewId: string | null | undefined) {
  return useQuery({
    queryKey: performanceReviewKeys.detail(reviewId ?? ''),
    queryFn: async () => {
      if (!reviewId) throw new Error('reviewId obrigatorio');
      const response = await reviewsService.getReview(reviewId);
      return {
        review: response.review,
        competencies: response.competencies ?? [],
      };
    },
    enabled: !!reviewId,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Cria nova competencia para uma performance review.
 */
export function useCreateCompetency(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewCompetencyData) =>
      reviewCompetenciesService.createCompetency(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: performanceReviewKeys.detail(reviewId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewCompetencyKeys.byReview(reviewId),
      });
      toast.success('Competencia adicionada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao adicionar competencia');
    },
  });
}

/**
 * Atualiza nome, peso, scores ou comentarios de uma competencia.
 */
export function useUpdateCompetency(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      competencyId,
      payload,
    }: {
      competencyId: string;
      payload: UpdateReviewCompetencyData;
    }) =>
      reviewCompetenciesService.updateCompetency(
        reviewId,
        competencyId,
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: performanceReviewKeys.detail(reviewId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewCompetencyKeys.byReview(reviewId),
      });
    },
    onError: () => {
      toast.error('Erro ao atualizar competencia');
    },
  });
}

/**
 * Remove uma competencia. Use sempre apos PIN de confirmacao.
 */
export function useDeleteCompetency(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (competencyId: string) =>
      reviewCompetenciesService.deleteCompetency(reviewId, competencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: performanceReviewKeys.detail(reviewId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewCompetencyKeys.byReview(reviewId),
      });
      toast.success('Competencia removida com sucesso');
    },
    onError: () => {
      toast.error('Erro ao remover competencia');
    },
  });
}

/**
 * Cria as 5 competencias padrao (Tecnica, Comunicacao, Lideranca, Ownership, Entrega)
 * via endpoint seed-defaults. Retorna a lista criada.
 */
export function useSeedDefaults(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reviewCompetenciesService.seedDefaults(reviewId),
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: performanceReviewKeys.detail(reviewId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewCompetencyKeys.byReview(reviewId),
      });
      toast.success(
        `${response.competencies.length} competencia(s) padrao restaurada(s)`
      );
    },
    onError: () => {
      toast.error('Erro ao restaurar competencias padrao');
    },
  });
}
