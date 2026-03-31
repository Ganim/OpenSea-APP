export type PaymentOrderStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export type BankPaymentMethod = 'PIX' | 'TED' | 'BOLETO';

export interface PaymentOrder {
  id: string;
  tenantId: string;
  entryId: string;
  bankAccountId: string;
  method: BankPaymentMethod;
  amount: number;
  recipientData: Record<string, unknown>;
  status: PaymentOrderStatus;
  requestedById: string;
  approvedById: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  externalId: string | null;
  receiptData: Record<string, unknown> | null;
  receiptFileId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PAYMENT_ORDER_STATUS_LABELS: Record<PaymentOrderStatus, string> = {
  PENDING_APPROVAL: 'Aguardando Aprovação',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
};

export const BANK_PAYMENT_METHOD_LABELS: Record<BankPaymentMethod, string> = {
  PIX: 'PIX',
  TED: 'TED',
  BOLETO: 'Boleto',
};
