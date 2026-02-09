/**
 * Label Template Editor - Constants
 * Constantes para o editor de templates de etiquetas
 */

import type { FieldCategory, LabelFieldDefinition } from './types';

/**
 * Campos disponíveis para arrastar no editor
 */
export const LABEL_FIELDS: LabelFieldDefinition[] = [
  // === PRODUTO ===
  {
    id: 'product-name',
    label: 'Nome do Produto',
    category: 'product',
    dataPath: 'product.name',
    type: 'text',
    sampleValue: 'Camiseta Básica',
    icon: 'Package',
    required: true,
  },
  {
    id: 'product-code',
    label: 'Código do Produto',
    category: 'product',
    dataPath: 'product.code',
    type: 'text',
    sampleValue: 'PROD-001',
    icon: 'Hash',
  },
  {
    id: 'manufacturer-name',
    label: 'Fabricante',
    category: 'product',
    dataPath: 'product.manufacturer.name',
    type: 'text',
    sampleValue: 'Acme Corp',
    icon: 'Building2',
  },
  {
    id: 'template-name',
    label: 'Tipo de Produto',
    category: 'product',
    dataPath: 'product.template.name',
    type: 'text',
    sampleValue: 'Vestuário',
    icon: 'FileText',
  },
  {
    id: 'product-unit',
    label: 'Unidade (abrev.)',
    category: 'product',
    dataPath: 'product.unit',
    type: 'text',
    sampleValue: 'm',
    icon: 'Ruler',
  },
  {
    id: 'product-unit-full',
    label: 'Unidade (completa)',
    category: 'product',
    dataPath: 'product.unitFull',
    type: 'text',
    sampleValue: 'metros',
    icon: 'Ruler',
  },

  // === VARIANTE ===
  {
    id: 'variant-name',
    label: 'Nome da Variante',
    category: 'variant',
    dataPath: 'variant.name',
    type: 'text',
    sampleValue: 'Azul - M',
    icon: 'Palette',
    required: true,
  },
  {
    id: 'variant-sku',
    label: 'SKU',
    category: 'variant',
    dataPath: 'variant.sku',
    type: 'text',
    sampleValue: 'CAM-AZU-M-001',
    icon: 'Tag',
  },
  {
    id: 'variant-reference',
    label: 'Referência',
    category: 'variant',
    dataPath: 'variant.reference',
    type: 'text',
    sampleValue: 'REF-2024-001',
    icon: 'FileCode',
  },
  {
    id: 'variant-barcode',
    label: 'Código de Barras (texto)',
    category: 'variant',
    dataPath: 'variant.barcode',
    type: 'text',
    sampleValue: '7891234567890',
    icon: 'Barcode',
  },

  // === ITEM ===
  {
    id: 'item-code',
    label: 'Código do Item',
    category: 'item',
    dataPath: 'item.uniqueCode',
    type: 'text',
    sampleValue: 'ITM-2024-00001',
    icon: 'Box',
    required: true,
  },
  {
    id: 'item-quantity',
    label: 'Quantidade',
    category: 'item',
    dataPath: 'item.currentQuantity',
    type: 'number',
    sampleValue: '10',
    icon: 'Hash',
  },
  {
    id: 'item-quantity-unit',
    label: 'Qtd + Unidade (abrev.)',
    category: 'item',
    dataPath: 'item.quantityWithUnit',
    type: 'text',
    sampleValue: '10 m',
    icon: 'Ruler',
  },
  {
    id: 'item-quantity-unit-full',
    label: 'Qtd + Unidade (completa)',
    category: 'item',
    dataPath: 'item.quantityWithUnitFull',
    type: 'text',
    sampleValue: '10 metros',
    icon: 'Ruler',
  },
  {
    id: 'item-batch',
    label: 'Lote',
    category: 'item',
    dataPath: 'item.batchNumber',
    type: 'text',
    sampleValue: 'LOTE-2024-01',
    icon: 'Layers',
  },
  {
    id: 'item-entry-date',
    label: 'Data de Entrada',
    category: 'item',
    dataPath: 'item.entryDate',
    type: 'date',
    sampleValue: '14/01/2024',
    icon: 'Calendar',
  },
  {
    id: 'item-expiry-date',
    label: 'Data de Validade',
    category: 'item',
    dataPath: 'item.expiryDate',
    type: 'date',
    sampleValue: '14/01/2025',
    icon: 'CalendarX',
  },

  // === LOCALIZAÇÃO ===
  {
    id: 'location-address',
    label: 'Endereço Completo',
    category: 'location',
    dataPath: 'item.resolvedAddress',
    type: 'text',
    sampleValue: 'A-01-02-03',
    icon: 'MapPin',
    required: true,
  },
  {
    id: 'warehouse-code',
    label: 'Código do Armazém',
    category: 'location',
    dataPath: 'item.bin.zone.aisle.warehouse.code',
    type: 'text',
    sampleValue: 'WH-01',
    icon: 'Warehouse',
  },
  {
    id: 'zone-name',
    label: 'Zona',
    category: 'location',
    dataPath: 'item.bin.zone.name',
    type: 'text',
    sampleValue: 'Zona A',
    icon: 'LayoutGrid',
  },

  // === CÓDIGOS (Imagens) ===
  {
    id: 'barcode-image',
    label: 'Código de Barras',
    category: 'codes',
    dataPath: 'variant.barcode',
    type: 'barcode',
    sampleValue: '7891234567890',
    icon: 'Barcode',
  },
  {
    id: 'qrcode-image',
    label: 'QR Code',
    category: 'codes',
    dataPath: 'item.uniqueCode',
    type: 'qrcode',
    sampleValue: 'ITM-2024-00001',
    icon: 'QrCode',
  },

  // === COMBINADOS ===
  {
    id: 'product-variant-name',
    label: 'Produto + Variante',
    category: 'custom',
    dataPath: 'combined.productVariantName',
    type: 'text',
    sampleValue: 'Camiseta Básica - Azul M',
    icon: 'Combine',
  },
  {
    id: 'reference-variant-name',
    label: 'Referência + Variante',
    category: 'custom',
    dataPath: 'combined.referenceVariantName',
    type: 'text',
    sampleValue: 'REF-2024-001 - Azul M',
    icon: 'Link',
  },
  {
    id: 'barcode-data',
    label: 'Dados do Barcode',
    category: 'custom',
    dataPath: 'item.barcodeData',
    type: 'text',
    sampleValue: '5.1.1.2.901.23/AA00023-1',
    icon: 'Barcode',
  },
  {
    id: 'custom-title',
    label: 'Título Personalizado',
    category: 'custom',
    dataPath: 'custom.title',
    type: 'text',
    sampleValue: 'IDENTIFICAÇÃO DE PRODUTO',
    icon: 'Type',
  },

  // === ATRIBUTOS TÊXTEIS ===
  {
    id: 'attr-composicao',
    label: 'Composição',
    category: 'attributes',
    dataPath: 'variant.attributes.composicao',
    type: 'text',
    sampleValue: '100% Algodão',
    icon: 'FileText',
  },
  {
    id: 'attr-cor',
    label: 'Cor',
    category: 'attributes',
    dataPath: 'variant.attributes.cor',
    type: 'text',
    sampleValue: '901 - Preto',
    icon: 'Palette',
  },
  {
    id: 'attr-gramatura',
    label: 'Gramatura',
    category: 'attributes',
    dataPath: 'variant.attributes.gramatura',
    type: 'text',
    sampleValue: '260 g/m²',
    icon: 'Scale',
  },
  {
    id: 'attr-dimensoes',
    label: 'Dimensões',
    category: 'attributes',
    dataPath: 'variant.attributes.dimensoes',
    type: 'text',
    sampleValue: 'L: 1,62m',
    icon: 'Ruler',
  },
  {
    id: 'attr-qualidade',
    label: 'Qualidade',
    category: 'attributes',
    dataPath: 'variant.attributes.qualidade',
    type: 'text',
    sampleValue: 'Premium',
    icon: 'Star',
  },
  {
    id: 'attr-nuance',
    label: 'Nuance',
    category: 'attributes',
    dataPath: 'variant.attributes.nuance',
    type: 'text',
    sampleValue: '-',
    icon: 'Droplet',
  },
];

/**
 * Categorias de campos organizadas
 */
export const FIELD_CATEGORIES: FieldCategory[] = [
  {
    id: 'product',
    label: 'Produto',
    icon: 'Package',
    fields: LABEL_FIELDS.filter(f => f.category === 'product'),
  },
  {
    id: 'variant',
    label: 'Variante',
    icon: 'Palette',
    fields: LABEL_FIELDS.filter(f => f.category === 'variant'),
  },
  {
    id: 'item',
    label: 'Item',
    icon: 'Box',
    fields: LABEL_FIELDS.filter(f => f.category === 'item'),
  },
  {
    id: 'location',
    label: 'Localização',
    icon: 'MapPin',
    fields: LABEL_FIELDS.filter(f => f.category === 'location'),
  },
  {
    id: 'codes',
    label: 'Códigos',
    icon: 'Barcode',
    fields: LABEL_FIELDS.filter(f => f.category === 'codes'),
  },
  {
    id: 'custom',
    label: 'Combinados',
    icon: 'Combine',
    fields: LABEL_FIELDS.filter(f => f.category === 'custom'),
  },
];

/**
 * Tamanhos de etiqueta pré-definidos
 */
export const LABEL_SIZE_PRESETS = [
  { id: 'small', name: 'Pequena', width: 40, height: 25 },
  { id: 'medium', name: 'Média', width: 60, height: 40 },
  { id: 'large', name: 'Grande', width: 100, height: 60 },
  { id: 'textile', name: 'Têxtil 100x100', width: 100, height: 100 },
  { id: 'textile-80', name: 'Têxtil 80x60', width: 80, height: 60 },
  { id: 'jewelry', name: 'Joalheria', width: 22, height: 10 },
  { id: 'clothing', name: 'Vestuário', width: 50, height: 30 },
  { id: 'shelf', name: 'Prateleira', width: 80, height: 50 },
] as const;

/**
 * Fontes disponíveis no editor
 */
export const AVAILABLE_FONTS = [
  'Arial',
  'Helvetica',
  'Verdana',
  'Roboto',
  'Open Sans',
  'Courier New',
  'monospace',
] as const;

/**
 * Tamanhos de fonte disponíveis
 */
export const FONT_SIZES = [
  6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48,
] as const;

/**
 * CSS base para o canvas do editor
 */
export const EDITOR_CANVAS_CSS = `
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    font-size: 10px;
    background: white;
  }
  .label-field {
    display: inline-block;
    padding: 2px 4px;
    border: 1px dashed #ccc;
    border-radius: 2px;
    min-width: 20px;
    min-height: 14px;
  }
  .label-field:hover {
    border-color: #007bff;
  }
  .barcode-container, .qrcode-container {
    display: inline-block;
    text-align: center;
  }
  .barcode-container img, .qrcode-container img {
    max-width: 100%;
    height: auto;
  }
`;

/**
 * Estilos padrão para campos
 */
export const DEFAULT_FIELD_STYLES = {
  text: {
    fontSize: '10px',
    fontFamily: 'Arial, sans-serif',
    color: '#000000',
    fontWeight: 'normal',
  },
  barcode: {
    width: '80px',
    height: '30px',
  },
  qrcode: {
    width: '40px',
    height: '40px',
  },
} as const;
