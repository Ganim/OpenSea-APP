/**
 * Geofence Zones Utils
 */

/**
 * Formata coordenadas para exibição
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Formata o raio para exibição
 */
export function formatRadius(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

/**
 * Gera URL do Google Maps para coordenadas
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Formata data para exibição em pt-BR
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}
