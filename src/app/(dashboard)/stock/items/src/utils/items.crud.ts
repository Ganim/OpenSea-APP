/**
 * Items Module CRUD Operations
 * Operações de CRUD para o módulo de items
 */

import { itemsService } from '@/services/stock';
import type { Item, RegisterItemEntryRequest } from '@/types/stock';

/**
 * Registra entrada de um novo item
 */
export async function registerItemEntry(
  data: RegisterItemEntryRequest
): Promise<Item> {
  const response = await itemsService.registerEntry(data);
  return response.item;
}

/**
 * Obtém um item por ID
 */
export async function getItem(id: string): Promise<Item> {
  const response = await itemsService.getItem(id);
  return response.item;
}

/**
 * Lista todos os items
 */
export async function listItems(): Promise<Item[]> {
  const response = await itemsService.listItems();
  return response.items;
}

/**
 * Items não possuem operação de update direto
 * Use movimentações de estoque
 */
export async function updateItem(): Promise<never> {
  throw new Error(
    'Items não podem ser editados. Use movimentações de estoque.'
  );
}

/**
 * Items não possuem operação de delete direto
 * Use movimentações de estoque
 */
export async function deleteItem(): Promise<never> {
  throw new Error(
    'Items não podem ser excluídos. Use movimentações de estoque.'
  );
}
