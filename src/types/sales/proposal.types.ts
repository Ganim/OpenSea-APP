// Proposal Types

import type { PaginatedQuery } from '../pagination';

export type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviada',
  UNDER_REVIEW: 'Em Análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  EXPIRED: 'Expirada',
};

export interface ProposalItem {
  id: string;
  proposalId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ProposalAttachment {
  id: string;
  proposalId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export interface Proposal {
  id: string;
  tenantId: string;
  customerId: string;
  customerName?: string;
  title: string;
  description?: string;
  status: ProposalStatus;
  validUntil?: string;
  terms?: string;
  totalValue: number;
  sentAt?: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  signatureEnvelopeId?: string | null;
  items?: ProposalItem[];
  attachments?: ProposalAttachment[];
}

export interface CreateProposalRequest {
  customerId: string;
  title: string;
  description?: string;
  validUntil?: string;
  terms?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface UpdateProposalRequest {
  title?: string;
  description?: string;
  validUntil?: string;
  terms?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface ProposalsQuery extends PaginatedQuery {
  status?: ProposalStatus;
  customerId?: string;
}
