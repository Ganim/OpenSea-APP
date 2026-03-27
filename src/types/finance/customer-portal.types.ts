// Customer Portal — Admin types
export interface CustomerPortalAccess {
  id: string;
  customerId: string;
  customerName: string | null;
  isActive: boolean;
  lastAccessAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface InviteCustomerPortalInput {
  customerId: string;
  customerName: string;
  expiresInDays?: number;
}

export interface InviteCustomerPortalResponse {
  access: CustomerPortalAccess & { accessToken: string };
  portalUrl: string;
}

export interface ListCustomerPortalAccessesResponse {
  accesses: CustomerPortalAccess[];
}

// Customer Portal — Public types
export interface PortalValidation {
  valid: boolean;
  customerName: string | null;
  expiresAt: string | null;
}

export interface PortalInvoice {
  id: string;
  code: string;
  description: string;
  expectedAmount: number;
  actualAmount: number | null;
  dueDate: string;
  paymentDate: string | null;
  status: string;
  pixKey: string | null;
  boletoDigitableLine: string | null;
  boletoPdfUrl: string | null;
}

export interface PortalInvoiceDetail extends PortalInvoice {
  discount: number;
  interest: number;
  penalty: number;
  issueDate: string;
}

export interface ListPortalInvoicesResponse {
  invoices: PortalInvoice[];
  total: number;
  customerName: string;
}

export interface GetPortalInvoiceResponse {
  invoice: PortalInvoiceDetail;
  customerName: string;
}

export interface GeneratePortalPaymentInput {
  method: 'PIX' | 'BOLETO';
}

export interface GeneratePortalPaymentResponse {
  invoiceId: string;
  method: 'PIX' | 'BOLETO';
  amount: number;
  pixCopiaECola: string | null;
  pixKey: string | null;
  boletoDigitableLine: string | null;
  boletoPdfUrl: string | null;
}
