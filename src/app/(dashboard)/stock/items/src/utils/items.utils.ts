/**
 * Items Module Utilities
 * Funções utilitárias para o módulo de items
 */

import type { Item } from '@/types/stock';
import { ITEM_STATUS_LABELS } from '../constants';

/**
 * Formata informações do item para exibição
 */
export function formatItemInfo(item: Item): string {
  const parts: string[] = [
    item.uniqueCode,
    item.batchNumber ? `Lote: ${item.batchNumber}` : null,
    `Qtd: ${item.currentQuantity}`,
  ].filter(Boolean) as string[];

  return parts.join(' • ');
}

/**
 * Obtém label do status do item
 */
export function getItemStatusLabel(status: Item['status']): string {
  return ITEM_STATUS_LABELS[status] || status;
}

/**
 * Verifica se um item está disponível para venda
 */
export function isItemAvailable(item: Item): boolean {
  return item.status === 'AVAILABLE' && item.currentQuantity > 0;
}

/**
 * Verifica se um item está próximo da validade
 */
export function isItemExpiringSoon(item: Item, daysThreshold = 30): boolean {
  if (!item.expiryDate) return false;

  const now = new Date();
  const expiryDate = new Date(item.expiryDate);
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
}

/**
 * Verifica se um item está vencido
 */
export function isItemExpired(item: Item): boolean {
  if (!item.expiryDate) return false;

  const now = new Date();
  const expiryDate = new Date(item.expiryDate);

  return expiryDate < now;
}

/**
 * Calcula a porcentagem de quantidade restante
 */
export function getQuantityPercentage(item: Item): number {
  if (item.initialQuantity === 0) return 0;
  return (item.currentQuantity / item.initialQuantity) * 100;
}
