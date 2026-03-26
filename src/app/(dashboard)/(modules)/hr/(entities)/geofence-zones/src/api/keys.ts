/**
 * OpenSea OS - Geofence Zones Query Keys
 */

export interface GeofenceZoneFilters {
  search?: string;
  isActive?: boolean;
}

export const geofenceZoneKeys = {
  all: ['geofence-zones'] as const,
  lists: () => [...geofenceZoneKeys.all, 'list'] as const,
  list: (filters?: GeofenceZoneFilters) =>
    [...geofenceZoneKeys.lists(), filters ?? {}] as const,
  details: () => [...geofenceZoneKeys.all, 'detail'] as const,
  detail: (id: string) => [...geofenceZoneKeys.details(), id] as const,
} as const;

export default geofenceZoneKeys;
