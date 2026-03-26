/**
 * Geofence Zone CRUD Operations
 */

import { logger } from '@/lib/logger';
import type { GeofenceZone, CreateGeofenceZoneData } from '@/types/hr';
import { geofenceZonesApi } from '../api';

/**
 * Criar nova zona de geofencing
 */
export async function createGeofenceZone(
  data: Partial<GeofenceZone>
): Promise<GeofenceZone> {
  const createData: CreateGeofenceZoneData = {
    name: data.name ?? '',
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    radiusMeters: data.radiusMeters ?? 200,
    isActive: data.isActive ?? true,
    address: data.address ?? null,
  };
  return geofenceZonesApi.create(createData);
}

/**
 * Atualizar zona de geofencing
 */
export async function updateGeofenceZone(
  id: string,
  data: Partial<GeofenceZone>
): Promise<GeofenceZone> {
  const cleanData: Record<string, unknown> = {};

  if (data.name !== undefined) cleanData.name = data.name;
  if (data.latitude !== undefined) cleanData.latitude = data.latitude;
  if (data.longitude !== undefined) cleanData.longitude = data.longitude;
  if (data.radiusMeters !== undefined)
    cleanData.radiusMeters = data.radiusMeters;
  if (data.isActive !== undefined) cleanData.isActive = data.isActive;
  if (data.address !== undefined) cleanData.address = data.address;

  return geofenceZonesApi.update(id, cleanData);
}

/**
 * Deletar zona de geofencing
 */
export async function deleteGeofenceZone(id: string): Promise<void> {
  return geofenceZonesApi.delete(id);
}

/**
 * Duplicar zona de geofencing
 */
export async function duplicateGeofenceZone(
  id: string,
  data?: Partial<GeofenceZone>
): Promise<GeofenceZone> {
  // We must find the zone from the list since there is no GET by ID endpoint
  const zones = await geofenceZonesApi.list();
  const original = zones.find(z => z.id === id);

  if (!original) {
    throw new Error('Zona de geofencing não encontrada');
  }

  const duplicateData: CreateGeofenceZoneData = {
    name: data?.name ?? `${original.name} (cópia)`,
    latitude: original.latitude,
    longitude: original.longitude,
    radiusMeters: original.radiusMeters,
    isActive: original.isActive,
    address: original.address,
  };

  try {
    return geofenceZonesApi.create(duplicateData);
  } catch (error) {
    logger.error(
      '[GeofenceZones] Duplication failed',
      error instanceof Error ? error : undefined,
      { originalId: id }
    );
    throw error;
  }
}
