export type PaymentLinkStatus = 'ACTIVE' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export interface PaymentLink {
  id: string;
  slug: string;
  amount: number;
  description: string;
  customerName: string | null;
  status: PaymentLinkStatus;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PaymentLinkDetail extends PaymentLink {
  pixCopiaECola: string | null;
  boletoDigitableLine: string | null;
  boletoPdfUrl: string | null;
}

export interface CreatePaymentLinkInput {
  amount: number;
  description: string;
  customerName?: string;
  entryId?: string;
  expiresAt?: string;
  enablePix?: boolean;
  enableBoleto?: boolean;
}
