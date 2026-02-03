/**
 * Print Queue Constants
 * Constantes e valores padrão do sistema de fila de impressão
 */

import type {
  LabelField,
  LabelTemplateDefinition,
  PageSettings,
} from './types';

// ============================================
// STORAGE
// ============================================

/** Chave do LocalStorage para a fila de impressão */
export const PRINT_QUEUE_STORAGE_KEY = 'opensea:print-queue';

/** Versão do schema do localStorage (para migração) */
export const PRINT_QUEUE_STORAGE_VERSION = 1;

// ============================================
// DEFAULT VALUES
// ============================================

/** Configurações de página padrão */
export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  labelsPerRow: 2,
  margins: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  },
  labelSpacing: {
    horizontal: 5,
    vertical: 5,
  },
  paperSize: 'A4',
  orientation: 'portrait',
};

/** Template padrão selecionado */
export const DEFAULT_TEMPLATE_ID = 'item-label-50x30';

/** Número máximo de itens na fila */
export const MAX_QUEUE_ITEMS = 100;

/** Número máximo de cópias por item */
export const MAX_COPIES_PER_ITEM = 999;

/** Número mínimo de cópias */
export const MIN_COPIES = 1;

// ============================================
// PAPER SIZES
// ============================================

/** Dimensões dos papéis em mm */
export const PAPER_SIZES = {
  A4: { width: 210, height: 297 },
  LETTER: { width: 215.9, height: 279.4 },
} as const;

// ============================================
// LABEL SIZES
// ============================================

/** Tamanhos de etiquetas pré-definidos em mm */
export const LABEL_SIZES = {
  /** Etiqueta pequena 30x20mm */
  SMALL: { width: 30, height: 20 },
  /** Etiqueta média 50x30mm */
  MEDIUM: { width: 50, height: 30 },
  /** Etiqueta grande 100x50mm */
  LARGE: { width: 100, height: 50 },
  /** Etiqueta quadrada 50x50mm */
  SQUARE: { width: 50, height: 50 },
  /** Etiqueta de joalheria 30x15mm */
  JEWELRY: { width: 30, height: 15 },
} as const;

// ============================================
// AVAILABLE FIELDS
// ============================================

/** Campos disponíveis para templates de etiquetas */
export const LABEL_AVAILABLE_FIELDS: LabelField[] = [
  // Campos do Produto
  {
    key: 'productName',
    label: 'Nome do Produto',
    source: 'product',
    path: 'name',
    type: 'text',
    defaultEnabled: true,
  },
  {
    key: 'productCode',
    label: 'Código do Produto',
    source: 'product',
    path: 'code',
    type: 'text',
    defaultEnabled: true,
  },
  {
    key: 'manufacturerName',
    label: 'Fabricante',
    source: 'product',
    path: 'manufacturer.name',
    type: 'text',
    defaultEnabled: true,
  },
  {
    key: 'productDescription',
    label: 'Descrição do Produto',
    source: 'product',
    path: 'description',
    type: 'text',
    defaultEnabled: false,
  },

  // Campos da Variante
  {
    key: 'variantName',
    label: 'Nome da Variante',
    source: 'variant',
    path: 'name',
    type: 'text',
    defaultEnabled: true,
  },
  {
    key: 'variantSku',
    label: 'SKU da Variante',
    source: 'variant',
    path: 'sku',
    type: 'text',
    defaultEnabled: true,
  },
  {
    key: 'variantCode',
    label: 'Código da Variante',
    source: 'variant',
    path: 'fullCode',
    type: 'text',
    defaultEnabled: true,
  },
  {
    key: 'variantReference',
    label: 'Referência',
    source: 'variant',
    path: 'reference',
    type: 'text',
    defaultEnabled: false,
  },
  {
    key: 'variantBarcode',
    label: 'Código de Barras (Variante)',
    source: 'variant',
    path: 'barcode',
    type: 'text',
    defaultEnabled: false,
  },
  {
    key: 'variantPrice',
    label: 'Preço',
    source: 'variant',
    path: 'price',
    type: 'number',
    defaultEnabled: false,
  },

  // Campos do Item
  {
    key: 'itemCode',
    label: 'Código do Item',
    source: 'item',
    path: 'uniqueCode',
    type: 'text',
    defaultEnabled: true,
  },
  {
    key: 'itemFullCode',
    label: 'Código Completo do Item',
    source: 'item',
    path: 'fullCode',
    type: 'text',
    defaultEnabled: false,
  },
  {
    key: 'itemQuantity',
    label: 'Quantidade',
    source: 'item',
    path: 'currentQuantity',
    type: 'number',
    defaultEnabled: true,
  },
  {
    key: 'stockLocation',
    label: 'Localização no Estoque',
    source: 'item',
    path: 'resolvedAddress',
    type: 'text',
    defaultEnabled: true,
  },
  {
    key: 'batchNumber',
    label: 'Número do Lote',
    source: 'item',
    path: 'batchNumber',
    type: 'text',
    defaultEnabled: false,
  },
  {
    key: 'expiryDate',
    label: 'Data de Validade',
    source: 'item',
    path: 'expiryDate',
    type: 'date',
    defaultEnabled: false,
  },
  {
    key: 'manufacturingDate',
    label: 'Data de Fabricação',
    source: 'item',
    path: 'manufacturingDate',
    type: 'date',
    defaultEnabled: false,
  },

  // Campos especiais (códigos)
  {
    key: 'barcodeImage',
    label: 'Código de Barras',
    source: 'item',
    path: 'id',
    type: 'barcode',
    defaultEnabled: true,
  },
  {
    key: 'qrcodeImage',
    label: 'QR Code',
    source: 'item',
    path: 'id',
    type: 'qrcode',
    defaultEnabled: false,
  },

  // Atributos dinâmicos
  {
    key: 'productAttributes',
    label: 'Atributos do Produto',
    source: 'product',
    path: 'attributes',
    type: 'text',
    defaultEnabled: false,
  },
  {
    key: 'variantAttributes',
    label: 'Atributos da Variante',
    source: 'variant',
    path: 'attributes',
    type: 'text',
    defaultEnabled: false,
  },
  {
    key: 'itemAttributes',
    label: 'Atributos do Item',
    source: 'item',
    path: 'attributes',
    type: 'text',
    defaultEnabled: false,
  },
];

// ============================================
// SYSTEM TEMPLATES
// ============================================

/** Templates de etiquetas do sistema */
export const SYSTEM_LABEL_TEMPLATES: LabelTemplateDefinition[] = [
  {
    id: 'item-label-50x30',
    name: 'Etiqueta Padrão (50x30mm)',
    description: 'Etiqueta padrão com código de barras e informações básicas',
    dimensions: { width: 50, height: 30 },
    isSystem: true,
    availableFields: LABEL_AVAILABLE_FIELDS,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'item-label-100x50',
    name: 'Etiqueta Grande (100x50mm)',
    description: 'Etiqueta grande com mais informações e QR Code',
    dimensions: { width: 100, height: 50 },
    isSystem: true,
    availableFields: LABEL_AVAILABLE_FIELDS,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'item-label-30x20',
    name: 'Etiqueta Pequena (30x20mm)',
    description: 'Etiqueta compacta apenas com código e localização',
    dimensions: { width: 30, height: 20 },
    isSystem: true,
    availableFields: LABEL_AVAILABLE_FIELDS,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'item-label-50x50-qr',
    name: 'Etiqueta QR Code (50x50mm)',
    description: 'Etiqueta quadrada focada no QR Code',
    dimensions: { width: 50, height: 50 },
    isSystem: true,
    availableFields: LABEL_AVAILABLE_FIELDS,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'item-label-jewelry',
    name: 'Etiqueta Joalheria (30x15mm)',
    description: 'Etiqueta pequena para joias e bijuterias',
    dimensions: { width: 30, height: 15 },
    isSystem: true,
    availableFields: LABEL_AVAILABLE_FIELDS,
    createdAt: new Date('2024-01-01'),
  },
];

// ============================================
// UNIT OF MEASURE LABELS
// ============================================

/** Labels das unidades de medida para exibição */
export const UNIT_OF_MEASURE_LABELS: Record<string, string> = {
  UNITS: 'un',
  KILOGRAMS: 'kg',
  GRAMS: 'g',
  LITERS: 'L',
  MILLILITERS: 'mL',
  METERS: 'm',
  CENTIMETERS: 'cm',
  MILLIMETERS: 'mm',
  SQUARE_METERS: 'm²',
  CUBIC_METERS: 'm³',
  PIECES: 'pç',
  BOXES: 'cx',
  PACKAGES: 'pct',
  BAGS: 'saco',
  BOTTLES: 'gar',
  CANS: 'lat',
  TUBES: 'tubo',
  ROLLS: 'rolo',
  SHEETS: 'fl',
  BARS: 'barra',
  COILS: 'bob',
  POUNDS: 'lb',
  OUNCES: 'oz',
  GALLONS: 'gal',
  QUARTS: 'qt',
  PINTS: 'pt',
  CUPS: 'xíc',
  TABLESPOONS: 'cs',
  TEASPOONS: 'cc',
  CUSTOM: '',
};
