'use client';

/**
 * OpenSea OS - /hr/crachas mutations
 *
 * TanStack Query mutation hooks for the crachás admin page. Each mutation
 * invalidates the `['crachas']` query key on success and surfaces a localized
 * toast. WeakPinError / other backend domain errors are propagated so the
 * calling component can render inline state if needed.
 *
 * Surface:
 *  - useRotateQrToken          (POST /v1/hr/employees/:id/qr-token/rotate)
 *  - useRotateQrTokensBulk     (POST /v1/hr/qr-tokens/rotate-bulk)
 *  - useCancelQrRotationBulk   (POST /v1/hr/qr-tokens/rotate-bulk/:jobId/cancel)
 *  - useEnqueueBulkBadgePdfs   (POST /v1/hr/qr-tokens/bulk-pdf)
 *  - useDownloadBadgePdf       (POST /v1/hr/employees/:id/badge-pdf → blob)
 */

import { crachasService } from '@/services/hr/crachas.service';
import { qrTokensService } from '@/services/hr/qr-tokens.service';
import type {
  BulkBadgePdfInput,
  BulkBadgePdfResponse,
  CancelBulkRotationResponse,
  RotateBulkInput,
  RotateBulkResponse,
  RotateQrTokenResponse,
} from '@/types/hr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function invalidateCrachas(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['crachas'] });
}

/* -------------------------------------------------------------------------- */
/* Individual QR rotation                                                     */
/* -------------------------------------------------------------------------- */

export function useRotateQrToken() {
  const queryClient = useQueryClient();
  return useMutation<RotateQrTokenResponse, Error, string>({
    mutationFn: (employeeId: string) => qrTokensService.rotate(employeeId),
    onSuccess: () => {
      invalidateCrachas(queryClient);
      toast.success('QR rotacionado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível rotacionar o QR.');
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Bulk QR rotation                                                           */
/* -------------------------------------------------------------------------- */

export function useRotateQrTokensBulk() {
  const queryClient = useQueryClient();
  return useMutation<RotateBulkResponse, Error, RotateBulkInput>({
    mutationFn: (input: RotateBulkInput) => qrTokensService.rotateBulk(input),
    onSuccess: data => {
      if (data.jobId === null) {
        toast.info('Nenhum funcionário correspondente ao filtro selecionado.');
        return;
      }
      invalidateCrachas(queryClient);
      toast.success(`Rotação iniciada para ${data.total} funcionário(s).`);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Não foi possível iniciar a rotação em lote.'
      );
    },
  });
}

export function useCancelQrRotationBulk() {
  const queryClient = useQueryClient();
  return useMutation<CancelBulkRotationResponse, Error, string>({
    mutationFn: (jobId: string) => qrTokensService.cancelBulk(jobId),
    onSuccess: () => {
      invalidateCrachas(queryClient);
      toast.success(
        'Cancelamento solicitado. Os lotes em andamento serão concluídos.'
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível cancelar a rotação.');
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Bulk badge PDF generation                                                  */
/* -------------------------------------------------------------------------- */

export function useEnqueueBulkBadgePdfs() {
  return useMutation<BulkBadgePdfResponse, Error, BulkBadgePdfInput>({
    mutationFn: (input: BulkBadgePdfInput) =>
      crachasService.enqueueBulkBadgePdfs(input),
    onSuccess: data => {
      if (data.jobId === null) {
        toast.info('Nenhum funcionário correspondente ao filtro selecionado.');
        return;
      }
      toast.success(
        `Geração de ${data.total} crachá(s) em PDF iniciada. Você será notificado ao concluir.`
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          'Não foi possível iniciar a geração dos crachás em lote.'
      );
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Individual badge PDF download                                              */
/* -------------------------------------------------------------------------- */

/**
 * Trigger the individual crachá download. The backend sets
 * `Content-Disposition: attachment; filename="cracha-{matricula}.pdf"` —
 * we honour it but fall back to a sensible name if the header is missing.
 */
export function useDownloadBadgePdf() {
  const queryClient = useQueryClient();
  return useMutation<
    { blob: Blob; filename: string },
    Error,
    { employeeId: string; registration?: string | null }
  >({
    mutationFn: async ({ employeeId }) =>
      crachasService.downloadBadgePdf(employeeId),
    onSuccess: (data, variables) => {
      const fallbackName = variables.registration
        ? `cracha-${variables.registration}.pdf`
        : 'cracha.pdf';
      const filename = data.filename || fallbackName;

      const url = window.URL.createObjectURL(data.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      invalidateCrachas(queryClient);
      toast.success('Crachá gerado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível gerar o crachá.');
    },
  });
}
