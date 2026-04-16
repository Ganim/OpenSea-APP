'use client';

/**
 * PayrollPDFPreviewModal
 *
 * Modal full-screen para visualizar holerite PDF gerado pelo backend.
 * Baixa o PDF binário via apiClient.getBlob (com auth token) e passa
 * como binaryData ao PdfViewer — evitando interceptação por IDM/extensões.
 *
 * Inspirado em Gusto: paystub preview com download e envio por e-mail.
 */

import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Loader2, Mail, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

const PdfViewer = dynamic(
  () => import('@/components/storage/pdf-viewer').then(m => m.PdfViewer),
  { ssr: false }
);

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

interface PayrollPDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollId: string;
  employeeId: string;
  employeeName?: string;
  referenceMonth: number;
  referenceYear: number;
  /** Optional company info — passed as querystring to the backend */
  companyName?: string;
  companyCnpj?: string;
}

export function PayrollPDFPreviewModal({
  isOpen,
  onClose,
  payrollId,
  employeeId,
  employeeName,
  referenceMonth,
  referenceYear,
  companyName,
  companyCnpj,
}: PayrollPDFPreviewModalProps) {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [filename, setFilename] = useState<string>('holerite.pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const periodLabel = `${MONTH_NAMES[referenceMonth - 1] ?? ''}/${referenceYear}`;

  const buildQuery = useCallback(() => {
    const params: Record<string, string> = {};
    if (companyName) params.companyName = companyName;
    if (companyCnpj) params.companyCnpj = companyCnpj;
    return params;
  }, [companyName, companyCnpj]);

  // Fetch PDF when modal opens
  useEffect(() => {
    if (!isOpen) {
      // reset state when closing so re-opening fetches fresh
      setPdfBytes(null);
      setErrorMessage(null);
      return;
    }

    let cancelled = false;

    async function fetchPdf() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const { blob, filename: serverFilename } = await apiClient.getBlob(
          `/v1/hr/payrolls/${payrollId}/payslip/${employeeId}`,
          { params: buildQuery() }
        );
        if (cancelled) return;
        const buffer = await blob.arrayBuffer();
        if (cancelled) return;
        setPdfBytes(new Uint8Array(buffer));
        setFilename(serverFilename || `holerite_${periodLabel}.pdf`);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : 'Erro ao carregar holerite';
        setErrorMessage(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPdf();

    return () => {
      cancelled = true;
    };
  }, [isOpen, payrollId, employeeId, buildQuery, periodLabel]);

  const handleDownload = useCallback(() => {
    if (!pdfBytes) return;
    try {
      // Copy to fresh ArrayBuffer to satisfy Blob's BlobPart typing
      // (avoids SharedArrayBuffer mismatch on stored Uint8Array).
      const arrayBuffer = pdfBytes.slice().buffer;
      const downloadBlob = new Blob([arrayBuffer], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Download iniciado');
    } catch {
      toast.error('Falha ao iniciar download');
    }
  }, [pdfBytes, filename]);

  const handleSendByEmail = useCallback(() => {
    // Backend endpoint para envio por e-mail ainda não disponível —
    // exibimos placeholder gentil enquanto a feature não existe.
    toast.info('Envio por e-mail em breve', {
      description:
        'A integração para envio do holerite por e-mail está em construção.',
    });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        data-testid="payroll-pdf-preview-modal"
        className="max-w-5xl w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col"
      >
        <DialogHeader className="px-5 py-4 border-b shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-indigo-500 to-violet-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold truncate">
                  Holerite — {periodLabel}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  {employeeName
                    ? `Funcionário: ${employeeName}`
                    : 'Pré-visualização do recibo de pagamento'}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendByEmail}
                data-testid="payroll-pdf-preview-send-email"
              >
                <Mail className="h-4 w-4" />
                Enviar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                disabled={!pdfBytes || isLoading}
                data-testid="payroll-pdf-preview-download"
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-[60vh] overflow-hidden bg-muted/30">
          {isLoading && (
            <div className="flex items-center justify-center w-full h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Gerando holerite...
                </p>
              </div>
            </div>
          )}
          {errorMessage && !isLoading && (
            <div className="flex items-center justify-center w-full h-full p-6">
              <div className="text-center max-w-md">
                <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-60" />
                <p className="text-sm font-medium mb-1">
                  Não foi possível gerar o holerite
                </p>
                <p className="text-xs text-muted-foreground">{errorMessage}</p>
              </div>
            </div>
          )}
          {pdfBytes && !isLoading && !errorMessage && (
            <PdfViewer binaryData={pdfBytes} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
