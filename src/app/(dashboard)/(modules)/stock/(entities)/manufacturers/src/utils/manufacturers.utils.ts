/**
 * Manufacturers Module Utilities
 */

import type { Manufacturer } from '@/types/stock';

/**
 * Formata informações do fabricante para exibição
 */
export function formatManufacturerInfo(manufacturer: Manufacturer): string {
  const parts: string[] = [
    manufacturer.name,
    manufacturer.country,
    manufacturer.city ? manufacturer.city : null,
  ].filter(Boolean) as string[];

  return parts.join(' • ');
}

/**
 * Verifica se um fabricante tem contato completo
 */
export function hasCompleteContact(manufacturer: Manufacturer): boolean {
  return !!(manufacturer.email || manufacturer.phone || manufacturer.website);
}
