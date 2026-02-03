/**
 * Utilitários para converter dados do estoque em dados de impressão
 */

import { ItemLabelData } from '@/core/printing/types';
import { Item, Product, Variant } from '@/types/stock';

/**
 * Converte dados do Item + Variant + Product para ItemLabelData
 */
export const convertToItemLabelData = (
  item: Item,
  variant?: Variant,
  product?: Product,
  additionalData?: {
    manufacturer?: string;
    stockLocation?: string;
    composition?: string;
    dimensions?: string;
    grammage?: string;
  }
): ItemLabelData => {
  // Extrai informações dos atributos customizados
  const itemAttrs = item.attributes || {};
  const variantAttrs = variant?.attributes || {};
  const productAttrs = product?.attributes || {};

  return {
    // Fabricante (pode vir de manufacturer ou attributes)
    manufacturer:
      additionalData?.manufacturer ||
      (productAttrs.manufacturer as string) ||
      'N/A',

    // Localização no estoque
    stockLocation:
      additionalData?.stockLocation || item.resolvedAddress || 'N/A',

    // Nome do produto
    product: product?.name || variant?.name || 'Produto',

    // Código do produto
    code: product?.fullCode || variant?.sku || 'N/A',

    // Composição (pode vir de attributes)
    composition:
      additionalData?.composition ||
      (productAttrs.composition as string) ||
      (variantAttrs.composition as string) ||
      'N/A',

    // Qualidade
    quality:
      (itemAttrs.quality as string) || (variantAttrs.quality as string) || '',

    // Cor
    color:
      (variantAttrs.color as string) || (productAttrs.color as string) || 'N/A',

    // Nuance
    nuance:
      (variantAttrs.nuance as string) || (itemAttrs.nuance as string) || '',

    // Dimensões
    dimensions:
      additionalData?.dimensions ||
      (itemAttrs.dimensions as string) ||
      (variantAttrs.dimensions as string) ||
      'N/A',

    // Gramatura
    grammage:
      additionalData?.grammage ||
      (itemAttrs.grammage as string) ||
      (variantAttrs.grammage as string) ||
      'N/A',

    // ID da peça (uniqueCode do item)
    pieceId: item.uniqueCode || item.id,

    // Quantidade
    quantity: `${item.currentQuantity} ${getUnitSymbol(productAttrs.unitOfMeasure as string)}`,

    // Código de barras (pode vir do variant ou do item)
    barcode:
      variant?.barcode ||
      variant?.eanCode ||
      `${item.variantId}/${item.uniqueCode}`,

    // Metadados
    printedAt: new Date(),
  };
};

/**
 * Obtém símbolo da unidade de medida
 */
const getUnitSymbol = (unit?: string): string => {
  const unitMap: Record<string, string> = {
    METERS: 'm',
    CENTIMETERS: 'cm',
    MILLIMETERS: 'mm',
    KILOGRAMS: 'kg',
    GRAMS: 'g',
    LITERS: 'L',
    MILLILITERS: 'ml',
    UNITS: 'un',
    PIECES: 'pç',
    ROLLS: 'rolo',
    SQUARE_METERS: 'm²',
    CUBIC_METERS: 'm³',
  };

  return unit ? unitMap[unit] || unit : 'un';
};

/**
 * Gera código de barras a partir de variant e item
 */
export const generateItemBarcode = (
  variantId: string,
  itemId: string
): string => {
  return `${variantId}/${itemId}`;
};

/**
 * Formata quantidade com unidade
 */
export const formatQuantityWithUnit = (
  quantity: number,
  unit: string,
  approximate: boolean = false
): string => {
  const symbol = getUnitSymbol(unit);
  const prefix = approximate ? '±' : '';
  return `${prefix}${quantity} ${symbol}`;
};
