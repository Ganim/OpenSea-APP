/**
 * Products Module Types
 */

import type { Item, Product } from '@/types/stock';

export interface ProductFormData {
  name: string;
  templateId: string;
  categoryId?: string;
  description?: string;
  notes?: string;
}

/**
 * Tipos de saída de estoque (alinhados com backend MovementType)
 */
export type ExitType =
  | 'SALE' // Venda
  | 'PRODUCTION' // Utilização / Consumo Interno
  | 'SAMPLE' // Amostra
  | 'LOSS' // Perda/Furto/Roubo
  | 'SUPPLIER_RETURN' // Devolução ao Fornecedor
  | 'TRANSFER'; // Transferência de Estoque

export const EXIT_TYPE_CONFIG: Record<
  ExitType,
  { label: string; description: string; icon: string }
> = {
  SALE: {
    label: 'Venda',
    description: 'Saída por venda ao cliente',
    icon: 'ShoppingCart',
  },
  PRODUCTION: {
    label: 'Utilização',
    description: 'Uso interno da empresa ou ordem de serviço',
    icon: 'Building',
  },
  SAMPLE: {
    label: 'Amostra',
    description: 'Saída para amostra ou mostruário',
    icon: 'Package',
  },
  LOSS: {
    label: 'Perda/Furto/Roubo',
    description: 'Item perdido, furtado ou roubado',
    icon: 'ShieldAlert',
  },
  SUPPLIER_RETURN: {
    label: 'Devolução ao Fornecedor',
    description: 'Retorno do item ao fornecedor',
    icon: 'Undo2',
  },
  TRANSFER: {
    label: 'Transferência de Estoque',
    description: 'Movimentação para outro local',
    icon: 'ArrowRightLeft',
  },
};

/**
 * Interface para item selecionado com informações adicionais
 */
export interface SelectedItemInfo {
  item: Item;
  variantId: string;
  variantName: string;
}

export type { Product };
