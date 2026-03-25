import { apiClient } from '@/lib/api-client';

// =============================================================================
// TYPES
// =============================================================================

export interface PunchConfiguration {
  id: string;
  tenantId: string;
  selfieRequired: boolean;
  gpsRequired: boolean;
  geofenceEnabled: boolean;
  qrCodeEnabled: boolean;
  directLoginEnabled: boolean;
  kioskModeEnabled: boolean;
  pwaEnabled: boolean;
  offlineAllowed: boolean;
  maxOfflineHours: number;
  toleranceMinutes: number;
  autoClockOutHours: number | null;
  pdfReceiptEnabled: boolean;
  defaultRadiusMeters: number;
}

export interface GeofenceZone {
  id: string;
  tenantId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  address: string | null;
}

export interface CreateGeofenceZoneData {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  address?: string | null;
}

export interface UpdateGeofenceZoneData {
  name?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  isActive?: boolean;
  address?: string | null;
}

// =============================================================================
// API
// =============================================================================

export const punchConfigApi = {
  getConfig: () =>
    apiClient.get<PunchConfiguration>('/v1/hr/punch-config'),

  updateConfig: (data: Partial<PunchConfiguration>) =>
    apiClient.patch<PunchConfiguration>('/v1/hr/punch-config', data),

  listZones: () =>
    apiClient.get<{ zones: GeofenceZone[] }>('/v1/hr/geofence-zones'),

  createZone: (data: CreateGeofenceZoneData) =>
    apiClient.post<GeofenceZone>('/v1/hr/geofence-zones', data),

  updateZone: (id: string, data: UpdateGeofenceZoneData) =>
    apiClient.patch<GeofenceZone>(`/v1/hr/geofence-zones/${id}`, data),

  deleteZone: (id: string) =>
    apiClient.delete(`/v1/hr/geofence-zones/${id}`),
};
