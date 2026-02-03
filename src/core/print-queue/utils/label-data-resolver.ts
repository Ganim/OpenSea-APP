/**
 * Label Data Resolver
 * Resolve dados do Item/Variant/Product para LabelData
 */

import type { Item, Product, Variant, TemplateAttribute } from '@/types/stock';
import { UNIT_OF_MEASURE_LABELS } from '../constants';
import type { LabelData } from '../types';

/**
 * Obtém valor de um objeto por caminho (ex: 'manufacturer.name')
 */
function getValueByPath(
  obj: Record<string, unknown> | undefined,
  path: string
): unknown {
  if (!obj) return undefined;

  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Formata um valor para exibição na etiqueta
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('pt-BR');
  }

  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR');
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }

  return String(value);
}

/**
 * Extrai atributos marcados para impressão
 */
function extractPrintableAttributes(
  attributes: Record<string, unknown> | undefined,
  templateAttributes: Record<string, TemplateAttribute> | undefined
): Record<string, unknown> {
  if (!attributes || !templateAttributes) {
    return {};
  }

  const printable: Record<string, unknown> = {};

  for (const [key, config] of Object.entries(templateAttributes)) {
    if (config.enablePrint && key in attributes) {
      const label = config.label || key;
      printable[label] = formatValue(attributes[key]);
    }
  }

  return printable;
}

/**
 * Resolve os dados de um item para o formato LabelData
 */
export function resolveLabelData(
  item: Item,
  variant?: Variant,
  product?: Product
): LabelData {
  // Extrair informações básicas
  const productName = product?.name || item.productName || '';
  const productCode = product?.fullCode || item.productCode || '';
  const variantName = variant?.name || item.variantName || '';
  const variantCode = variant?.fullCode || item.variantSku || '';
  const variantSku = variant?.sku || item.variantSku || '';
  const variantReference = variant?.reference || '';
  const manufacturerName = (product?.manufacturer?.name as string) || '';

  // Localização
  const stockLocation = item.resolvedAddress || '';
  const warehouseCode = item.bin?.zone?.warehouseId || '';
  const zoneName = item.bin?.zone?.name || '';
  const binAddress = item.bin?.address || '';

  // Unidade de medida
  const unitOfMeasure = product?.template?.unitOfMeasure || 'UNITS';
  const itemUnitOfMeasure = UNIT_OF_MEASURE_LABELS[unitOfMeasure] || 'un';

  // Atributos para impressão
  // O tipo template no Product é simplificado, então fazemos cast para any
  const templateData = product?.template as unknown as {
    productAttributes?: Record<string, TemplateAttribute>;
    variantAttributes?: Record<string, TemplateAttribute>;
    itemAttributes?: Record<string, TemplateAttribute>;
  };

  const productAttributes = extractPrintableAttributes(
    product?.attributes as Record<string, unknown>,
    templateData?.productAttributes
  );

  const variantAttributes = extractPrintableAttributes(
    variant?.attributes as Record<string, unknown>,
    templateData?.variantAttributes
  );

  const itemAttributes = extractPrintableAttributes(
    item.attributes as Record<string, unknown>,
    templateData?.itemAttributes
  );

  // Campos combinados
  const productVariantName = variantName
    ? `${productName} - ${variantName}`
    : productName;

  const referenceVariantName = variantReference
    ? `${variantReference} - ${variantName}`
    : variantName;

  // Dados para códigos
  const barcodeData = variant?.barcode || item.uniqueCode || item.id;
  const qrCodeData = item.id;

  return {
    // Fabricante
    manufacturerName,

    // Localização
    stockLocation,
    warehouseCode,
    zoneName,
    binAddress,

    // Produto
    productName,
    productCode,
    productDescription: product?.description,

    // Variante
    variantName,
    variantCode,
    variantSku,
    variantReference,
    variantBarcode: variant?.barcode,

    // Item
    itemCode: item.uniqueCode || item.fullCode || '',
    itemId: item.id,
    itemQuantity: item.currentQuantity,
    itemUnitOfMeasure,
    itemBatchNumber: item.batchNumber,

    // Combinados
    productVariantName,
    referenceVariantName,

    // Atributos
    productAttributes,
    variantAttributes,
    itemAttributes,

    // Códigos
    barcodeData,
    qrCodeData,
  };
}

/**
 * Resolve dados de múltiplos itens
 */
export function resolveMultipleLabelData(
  items: Array<{
    item: Item;
    variant?: Variant;
    product?: Product;
    copies?: number;
  }>
): LabelData[] {
  const results: LabelData[] = [];

  for (const { item, variant, product, copies = 1 } of items) {
    const labelData = resolveLabelData(item, variant, product);

    // Adicionar cópias
    for (let i = 0; i < copies; i++) {
      results.push(labelData);
    }
  }

  return results;
}

/**
 * Gera dados de exemplo para preview
 */
export function getSampleLabelData(): LabelData {
  return {
    manufacturerName: 'Fabricante Exemplo',
    stockLocation: 'A-01-02-B',
    warehouseCode: 'ARM-01',
    zoneName: 'Estoque Principal',
    binAddress: 'A-01-02-B',
    productName: 'Produto Exemplo',
    productCode: 'PROD-001',
    productDescription: 'Descrição do produto exemplo',
    variantName: 'Azul M',
    variantCode: 'VAR-001-AZL-M',
    variantSku: 'SKU-001-AZL-M',
    variantReference: 'REF-001',
    variantBarcode: '7891234567890',
    itemCode: 'ITM-00001',
    itemId: 'sample-item-id',
    itemQuantity: 10,
    itemUnitOfMeasure: 'un',
    itemBatchNumber: 'LOTE-2024-001',
    productVariantName: 'Produto Exemplo - Azul M',
    referenceVariantName: 'REF-001 - Azul M',
    productAttributes: {
      Material: 'Algodão',
      Peso: '250g',
    },
    variantAttributes: {
      Cor: 'Azul',
      Tamanho: 'M',
    },
    itemAttributes: {
      Validade: '31/12/2025',
    },
    barcodeData: '7891234567890',
    qrCodeData: 'sample-item-id',
  };
}
