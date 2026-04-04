// =============================================================================
// Payment Gateway Configuration Types
// =============================================================================

export type PaymentProviderName = 'manual' | 'infinitepay' | 'asaas'

export interface ConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'select'
  required: boolean
  placeholder?: string
  helpText?: string
  options?: Array<{ label: string; value: string }>
}

export interface ProviderInfo {
  name: PaymentProviderName
  displayName: string
  supportedMethods: string[]
  configFields: ConfigField[]
}

export interface TenantPaymentConfig {
  id: string
  primaryProvider: PaymentProviderName
  primaryActive: boolean
  primaryTestedAt: string | null
  primaryConfigured: boolean
  primaryMaskedKey?: string
  fallbackProvider: PaymentProviderName | null
  fallbackActive: boolean
  fallbackTestedAt: string | null
  fallbackConfigured: boolean
  fallbackMaskedKey?: string
}

export interface SavePaymentConfigRequest {
  primaryProvider: PaymentProviderName
  primaryConfig: Record<string, string>
  fallbackProvider?: PaymentProviderName
  fallbackConfig?: Record<string, string>
}

export interface TestConnectionResponse {
  ok: boolean
  message: string
}

// =============================================================================
// Payment Charge Types
// =============================================================================

export type PaymentChargeStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED'

export interface PaymentCharge {
  id: string
  provider: string
  method: string
  amount: number
  status: PaymentChargeStatus
  qrCode?: string
  checkoutUrl?: string
  boletoUrl?: string
  boletoBarcode?: string
  expiresAt?: string
}

export interface CreateChargeRequest {
  orderId: string
  method: string
  amount: number
  installments?: number
}
