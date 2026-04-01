import { apiClient } from '@/lib/api-client';

// ============================================================================
// BOLETO SERVICE
// ============================================================================

export interface EmitBoletoData {
  entryId: string;
  bankAccountId: string;
  isHybrid?: boolean;
}

export interface EmitBoletoResponse {
  nossoNumero: string;
  barcode: string;
  digitableLine: string;
  pdfUrl?: string;
  dueDate?: string;
  amount?: number;
}

export interface BoletoDetailsResponse {
  nossoNumero: string;
  barcode: string;
  digitableLine: string;
  pdfUrl?: string;
  dueDate?: string;
  amount?: number;
  status?: string;
}

export interface CancelBoletoData {
  entryId: string;
  bankAccountId: string;
}

export const boletoService = {
  async emit(data: EmitBoletoData): Promise<EmitBoletoResponse> {
    return apiClient.post<EmitBoletoResponse>('/v1/finance/boleto/emit', data);
  },

  async cancel(nossoNumero: string, data: CancelBoletoData): Promise<void> {
    await apiClient.delete<void>(`/v1/finance/boleto/${nossoNumero}`, {
      body: JSON.stringify(data),
    });
  },

  async get(
    nossoNumero: string,
    bankAccountId: string
  ): Promise<BoletoDetailsResponse> {
    return apiClient.get<BoletoDetailsResponse>(
      `/v1/finance/boleto/${nossoNumero}?bankAccountId=${bankAccountId}`
    );
  },
};

// ============================================================================
// PIX CHARGE SERVICE
// ============================================================================

export interface CreatePixChargeServiceData {
  entryId: string;
  bankAccountId: string;
  expiresInSeconds?: number;
}

export interface PixChargeServiceResponse {
  txId: string;
  pixCopiaECola: string;
  qrCodeUrl?: string;
  expiresAt: string;
  amount: number;
}

export interface PixChargeDetailsResponse {
  txId: string;
  status: string;
  amount: number;
  pixCopiaECola?: string;
  qrCodeUrl?: string;
  expiresAt?: string;
  paidAt?: string;
}

export const pixChargeService = {
  async create(
    data: CreatePixChargeServiceData
  ): Promise<PixChargeServiceResponse> {
    return apiClient.post<PixChargeServiceResponse>(
      '/v1/finance/pix/charge',
      data
    );
  },

  async get(
    txId: string,
    bankAccountId: string
  ): Promise<PixChargeDetailsResponse> {
    return apiClient.get<PixChargeDetailsResponse>(
      `/v1/finance/pix/charge/${txId}?bankAccountId=${bankAccountId}`
    );
  },
};
