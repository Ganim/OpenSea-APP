/**
 * SignatureStatusSection
 * Seção reutilizável de assinatura digital para orçamentos e propostas
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useRequestQuoteSignature,
  useQuoteSignatureStatus,
} from '@/hooks/sales/use-quotes';
import {
  useRequestProposalSignature,
  useProposalSignatureStatus,
} from '@/hooks/sales/use-proposals';
import type {
  EnvelopeStatus,
  SignerStatus,
  SignatureEnvelopeSigner,
} from '@/types/signature/envelope.types';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSignature,
  Loader2,
  Mail,
  PenTool,
  User,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface SignatureStatusSectionProps {
  entityId: string;
  entityType: 'quote' | 'proposal';
  signatureEnvelopeId?: string | null;
  canRequestSignature?: boolean;
  defaultSignerName?: string;
  defaultSignerEmail?: string;
}

// ============================================================================
// STATUS LABELS & COLORS
// ============================================================================

const ENVELOPE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
  REJECTED: 'Rejeitada',
};

const ENVELOPE_STATUS_COLORS: Record<string, string> = {
  DRAFT:
    'border-gray-300 dark:border-white/[0.1] bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400',
  PENDING:
    'border-amber-600/25 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/8 text-amber-700 dark:text-amber-300',
  IN_PROGRESS:
    'border-sky-600/25 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/8 text-sky-700 dark:text-sky-300',
  COMPLETED:
    'border-emerald-600/25 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-300',
  REJECTED:
    'border-rose-600/25 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/8 text-rose-700 dark:text-rose-300',
  CANCELLED:
    'border-slate-600/25 dark:border-slate-500/20 bg-slate-50 dark:bg-slate-500/8 text-slate-700 dark:text-slate-300',
  EXPIRED:
    'border-amber-600/25 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/8 text-amber-700 dark:text-amber-300',
};

const SIGNER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  NOTIFIED: 'Notificado',
  VIEWED: 'Visualizado',
  SIGNED: 'Assinado',
  REJECTED: 'Rejeitado',
  EXPIRED: 'Expirado',
};

const SIGNER_STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  NOTIFIED: Mail,
  VIEWED: User,
  SIGNED: CheckCircle2,
  REJECTED: XCircle,
  EXPIRED: Clock,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function SignatureStatusSection({
  entityId,
  entityType,
  signatureEnvelopeId,
  canRequestSignature = false,
  defaultSignerName = '',
  defaultSignerEmail = '',
}: SignatureStatusSectionProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [signerEmail, setSignerEmail] = useState(defaultSignerEmail);

  // Use the correct hooks based on entity type
  const quoteSignatureMutation = useRequestQuoteSignature();
  const proposalSignatureMutation = useRequestProposalSignature();

  const quoteStatusQuery = useQuoteSignatureStatus(
    entityType === 'quote' ? entityId : ''
  );
  const proposalStatusQuery = useProposalSignatureStatus(
    entityType === 'proposal' ? entityId : ''
  );

  const signatureMutation =
    entityType === 'quote' ? quoteSignatureMutation : proposalSignatureMutation;

  const statusQuery =
    entityType === 'quote' ? quoteStatusQuery : proposalStatusQuery;

  const signatureData = statusQuery.data as
    | {
        envelopeId?: string;
        status?: EnvelopeStatus;
        signers?: SignatureEnvelopeSigner[];
      }
    | undefined;

  const hasSignature = !!signatureEnvelopeId || !!signatureData?.envelopeId;
  const envelopeId = signatureEnvelopeId || signatureData?.envelopeId;
  const envelopeStatus = signatureData?.status;
  const signers = signatureData?.signers ?? [];

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRequestSignature = async () => {
    try {
      await signatureMutation.mutateAsync({
        id: entityId,
        data: {
          signerName: signerName || undefined,
          signerEmail: signerEmail || undefined,
        },
      });
      toast.success('Assinatura digital solicitada com sucesso!');
      setShowRequestDialog(false);
    } catch {
      toast.error('Erro ao solicitar assinatura digital');
    }
  };

  const handleOpenDialog = () => {
    setSignerName(defaultSignerName);
    setSignerEmail(defaultSignerEmail);
    setShowRequestDialog(true);
  };

  // ============================================================================
  // RENDER — NO SIGNATURE
  // ============================================================================

  if (!hasSignature) {
    return (
      <>
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PenTool className="h-5 w-5 text-foreground" />
                <div>
                  <h3 className="text-base font-semibold">
                    Assinatura Digital
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Solicite a assinatura digital deste documento
                  </p>
                </div>
              </div>
              <div className="border-b border-border" />
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileSignature className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-base font-semibold text-muted-foreground">
                Nenhuma assinatura solicitada
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Este documento ainda não foi enviado para assinatura digital.
              </p>
              {canRequestSignature && (
                <Button
                  size="sm"
                  onClick={handleOpenDialog}
                  className="h-9 px-2.5"
                >
                  <PenTool className="h-4 w-4 mr-1.5" />
                  Solicitar Assinatura
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Request Signature Dialog */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Solicitar Assinatura Digital</DialogTitle>
              <DialogDescription>
                Informe os dados do signatário para enviar o documento para
                assinatura digital.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="signer-name">Nome do Signatário</Label>
                <Input
                  id="signer-name"
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  placeholder="Nome completo do signatário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signer-email">E-mail do Signatário</Label>
                <Input
                  id="signer-email"
                  type="email"
                  value={signerEmail}
                  onChange={e => setSignerEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
                className="h-9 px-2.5"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRequestSignature}
                disabled={signatureMutation.isPending}
                className="h-9 px-2.5"
              >
                {signatureMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                )}
                Solicitar Assinatura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ============================================================================
  // RENDER — WITH SIGNATURE
  // ============================================================================

  return (
    <Card className="bg-white/5 py-2 overflow-hidden">
      <div className="px-6 py-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PenTool className="h-5 w-5 text-foreground" />
              <div>
                <h3 className="text-base font-semibold">Assinatura Digital</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe o status da assinatura deste documento
                </p>
              </div>
            </div>
            {envelopeStatus && (
              <div
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border',
                  ENVELOPE_STATUS_COLORS[envelopeStatus] ??
                    ENVELOPE_STATUS_COLORS.PENDING
                )}
              >
                {ENVELOPE_STATUS_LABELS[envelopeStatus] ?? envelopeStatus}
              </div>
            )}
          </div>
          <div className="border-b border-border" />
        </div>

        {/* Signers List */}
        {signers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Signatários
            </p>
            {signers.map((signer: SignatureEnvelopeSigner) => {
              const SignerIcon = SIGNER_STATUS_ICONS[signer.status] ?? Clock;
              const signerName = signer.externalName || 'Signatário';
              const signerEmail = signer.externalEmail || '';
              const statusLabel =
                SIGNER_STATUS_LABELS[signer.status] ?? signer.status;

              return (
                <div
                  key={signer.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 dark:bg-slate-800/60"
                >
                  <SignerIcon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      signer.status === 'SIGNED'
                        ? 'text-emerald-500'
                        : signer.status === 'REJECTED'
                          ? 'text-rose-500'
                          : 'text-muted-foreground'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{signerName}</p>
                    {signerEmail && (
                      <p className="text-xs text-muted-foreground truncate">
                        {signerEmail}
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
                      signer.status === 'SIGNED'
                        ? 'border-emerald-600/25 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-300'
                        : signer.status === 'REJECTED'
                          ? 'border-rose-600/25 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/8 text-rose-700 dark:text-rose-300'
                          : 'border-amber-600/25 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/8 text-amber-700 dark:text-amber-300'
                    )}
                  >
                    {statusLabel}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Link to envelope detail */}
        {envelopeId && (
          <div className="pt-2">
            <Link
              href={`/signature/envelopes/${envelopeId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Detalhes do Envelope
            </Link>
          </div>
        )}

        {statusQuery.isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </Card>
  );
}
