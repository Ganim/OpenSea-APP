/**
 * Unit of Measure Labels
 * Mapeamento de unidades de medida para labels em português
 */

export { UNIT_OF_MEASURE_LABELS } from '@/types/stock';
import type { UnitOfMeasure } from '@/types/stock';
import { UNIT_OF_MEASURE_LABELS } from '@/types/stock';

/**
 * @deprecated Use UNIT_OF_MEASURE_LABELS from @/types/stock instead
 */
export const UNIT_LABELS = UNIT_OF_MEASURE_LABELS;

/**
 * Função helper para obter label de unidade de medida
 * @param unit - Unidade de medida
 * @returns Label em português ou a unidade original se não encontrada
 */
export function getUnitLabel(unit: UnitOfMeasure | string): string {
  return UNIT_OF_MEASURE_LABELS[unit as UnitOfMeasure] || unit;
}
