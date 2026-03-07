/**
 * Format a date value to Brazilian locale string (dd/mm/yyyy)
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return parsedDate.toLocaleDateString('pt-BR');
}

/**
 * Format a numeric value to Brazilian Real currency (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
