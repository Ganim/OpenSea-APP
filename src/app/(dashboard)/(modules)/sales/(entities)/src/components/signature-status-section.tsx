/**
 * Sales wrapper around the shared SignatureStatusSection component.
 *
 * Bridges Sales-specific React Query hooks (quote / proposal) into the
 * shared, module-agnostic signature UI under `@/components/signature/`.
 */

'use client';

import { SignatureStatusSection as SharedSignatureStatusSection } from '@/components/signature/signature-status-section';
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
  SignatureEnvelopeSigner,
} from '@/types/signature/envelope.types';

interface SignatureStatusSectionProps {
  entityId: string;
  entityType: 'quote' | 'proposal';
  signatureEnvelopeId?: string | null;
  canRequestSignature?: boolean;
  defaultSignerName?: string;
  defaultSignerEmail?: string;
}

export function SignatureStatusSection({
  entityId,
  entityType,
  signatureEnvelopeId,
  canRequestSignature = false,
  defaultSignerName = '',
  defaultSignerEmail = '',
}: SignatureStatusSectionProps) {
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

  const statusData = statusQuery.data as
    | {
        envelopeId?: string;
        status?: EnvelopeStatus;
        signers?: SignatureEnvelopeSigner[];
      }
    | undefined;

  return (
    <SharedSignatureStatusSection
      signatureEnvelopeId={signatureEnvelopeId}
      canRequestSignature={canRequestSignature}
      defaultSignerName={defaultSignerName}
      defaultSignerEmail={defaultSignerEmail}
      statusData={statusData}
      isStatusLoading={statusQuery.isLoading}
      onRequestSignature={async payload => {
        await signatureMutation.mutateAsync({
          id: entityId,
          data: {
            signerName: payload.signerName,
            signerEmail: payload.signerEmail,
          },
        });
      }}
      isRequestPending={signatureMutation.isPending}
    />
  );
}
