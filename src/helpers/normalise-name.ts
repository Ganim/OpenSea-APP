/**
 * Normalise a name the same way the backend generates an auto-SKU.
 * Used to detect when a SKU was auto-generated from the variant name.
 */
export function normaliseName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase();
}
