/**
 * Unit of Measure Labels
 * Mapeamento de unidades de medida para labels em português
 */

import type { UnitOfMeasure } from '@/types/stock';

export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  UNITS: 'Unidades',
  KILOGRAMS: 'Quilogramas',
  GRAMS: 'Gramas',
  LITERS: 'Litros',
  MILLILITERS: 'Mililitros',
  METERS: 'Metros',
  CENTIMETERS: 'Centímetros',
  MILLIMETERS: 'Milímetros',
  SQUARE_METERS: 'Metros Quadrados',
  CUBIC_METERS: 'Metros Cúbicos',
  PIECES: 'Peças',
  BOXES: 'Caixas',
  PACKAGES: 'Pacotes',
  BAGS: 'Sacolas',
  BOTTLES: 'Garrafas',
  CANS: 'Latas',
  TUBES: 'Tubos',
  ROLLS: 'Rolos',
  SHEETS: 'Folhas',
  BARS: 'Barras',
  COILS: 'Bobinas',
  POUNDS: 'lb',
  OUNCES: 'oz',
  GALLONS: 'gal',
  QUARTS: 'qt',
  PINTS: 'pt',
  CUPS: 'cp',
  TABLESPOONS: 'tbsp',
  TEASPOONS: 'tsp',
  CUSTOM: 'Personalizado',
};

/**
 * Função helper para obter label de unidade de medida
 * @param unit - Unidade de medida
 * @returns Label em português ou a unidade original se não encontrada
 */
export function getUnitLabel(unit: UnitOfMeasure | string): string {
  return UNIT_LABELS[unit as UnitOfMeasure] || unit;
}
