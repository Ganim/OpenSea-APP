/**
 * Punch Configuration Types
 * Tipos para configuração de ponto e geofence
 */

export interface PunchConfiguration {
  id: string;
  tenantId: string;

  // Métodos de autenticação
  selfieRequired: boolean;
  gpsRequired: boolean;
  geofenceEnabled: boolean;
  qrCodeEnabled: boolean;

  // Métodos de acesso
  directLoginEnabled: boolean;
  kioskModeEnabled: boolean;
  pwaEnabled: boolean;

  // Regras
  offlineAllowed: boolean;
  maxOfflineHours: number;
  toleranceMinutes: number;
  autoClockOutHours: number | null;

  // Comprovante
  pdfReceiptEnabled: boolean;

  // Geofence
  defaultRadiusMeters: number;

  createdAt: string;
  updatedAt: string;
}

export interface UpdatePunchConfigData {
  selfieRequired?: boolean;
  gpsRequired?: boolean;
  geofenceEnabled?: boolean;
  qrCodeEnabled?: boolean;
  directLoginEnabled?: boolean;
  kioskModeEnabled?: boolean;
  pwaEnabled?: boolean;
  offlineAllowed?: boolean;
  maxOfflineHours?: number;
  toleranceMinutes?: number;
  autoClockOutHours?: number | null;
  pdfReceiptEnabled?: boolean;
  defaultRadiusMeters?: number;
}

export interface GeofenceValidationResult {
  isValid: boolean;
  zoneName?: string;
  distance?: number;
}
