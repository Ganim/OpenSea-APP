/**
 * Print Queue Types
 * Sistema de fila de impressão de etiquetas - Multi-Entidade
 */

import type { Employee } from '@/types/hr';
import type { Item, Product, Variant } from '@/types/stock';

// ============================================
// ENTITY TYPE
// ============================================

export type PrintQueueEntityType = 'stock-item' | 'employee';

// ============================================
// PRINT QUEUE ITEM (discriminated union)
// ============================================

interface PrintQueueItemBase {
  /** ID único do item na fila (gerado) */
  queueId: string;

  /** Tipo da entidade */
  entityType: PrintQueueEntityType;

  /** Número de cópias da etiqueta */
  copies: number;

  /** Posição na fila (para ordenação) */
  order: number;

  /** Data/hora em que foi adicionado à fila */
  addedAt: Date;
}

export interface PrintQueueStockItem extends PrintQueueItemBase {
  entityType: 'stock-item';

  /** Item do estoque sendo impresso */
  item: Item;

  /** Variante associada (para dados da etiqueta) */
  variant?: Variant;

  /** Produto associado (para dados da etiqueta) */
  product?: Product;
}

export interface PrintQueueEmployeeItem extends PrintQueueItemBase {
  entityType: 'employee';

  /** Funcionário sendo impresso */
  employee: Employee;
}

/**
 * Representa um item na fila de impressão (discriminated union)
 */
export type PrintQueueItem = PrintQueueStockItem | PrintQueueEmployeeItem;

// ============================================
// ADD TO QUEUE INPUT (discriminated union)
// ============================================

export interface AddStockItemInput {
  entityType?: 'stock-item';
  item: Item;
  variant?: Variant;
  product?: Product;
  copies?: number;
}

export interface AddEmployeeInput {
  entityType: 'employee';
  employee: Employee;
  copies?: number;
}

/**
 * Input para adicionar item à fila
 */
export type AddToQueueInput = AddStockItemInput | AddEmployeeInput;

// ============================================
// HELPERS
// ============================================

/** Obtém o ID da entidade de um PrintQueueItem */
export function getEntityId(item: PrintQueueItem): string {
  if (item.entityType === 'employee') {
    return item.employee.id;
  }
  return item.item.id;
}

/** Obtém o ID da entidade de um AddToQueueInput */
export function getInputEntityId(input: AddToQueueInput): string {
  if (input.entityType === 'employee') {
    return input.employee.id;
  }
  return input.item.id;
}

// ============================================
// PAGE SETTINGS
// ============================================

/**
 * Configuração de layout da página
 */
export interface PageSettings {
  /** Número de etiquetas por linha */
  labelsPerRow: 1 | 2 | 3 | 4;

  /** Margens da página em mm */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  /** Espaçamento entre etiquetas em mm */
  labelSpacing: {
    horizontal: number;
    vertical: number;
  };

  /** Tamanho do papel */
  paperSize: 'A4' | 'LETTER' | 'CUSTOM';

  /** Orientação do papel */
  orientation: 'portrait' | 'landscape';

  /** Dimensões customizadas (quando paperSize = CUSTOM) */
  customDimensions?: {
    width: number;
    height: number;
  };
}

// ============================================
// PRINT QUEUE STATE
// ============================================

/**
 * Estado da fila de impressão (salvo no LocalStorage)
 */
export interface PrintQueueState {
  /** Itens na fila */
  items: PrintQueueItem[];

  /** ID do template selecionado */
  selectedTemplateId: string;

  /** Dimensões do template selecionado (para templates da API que não estão no SYSTEM_LABEL_TEMPLATES) */
  selectedTemplateDimensions: { width: number; height: number } | null;

  /** Configurações de página */
  pageSettings: PageSettings;

  /** Última atualização */
  updatedAt: Date;
}

// ============================================
// LABEL TEMPLATE
// ============================================

/**
 * Tipo de campo da etiqueta
 */
export type LabelFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'barcode'
  | 'qrcode'
  | 'image';

/**
 * Fonte de dados do campo
 */
export type LabelFieldSource = 'product' | 'variant' | 'item';

/**
 * Definição de campo disponível para etiqueta
 */
export interface LabelField {
  /** Chave do campo (ex: 'manufacturerName') */
  key: string;

  /** Label de exibição */
  label: string;

  /** Entidade fonte: product, variant ou item */
  source: LabelFieldSource;

  /** Caminho para o valor no objeto fonte */
  path: string;

  /** Tipo do campo */
  type: LabelFieldType;

  /** Se está habilitado por padrão */
  defaultEnabled: boolean;
}

/**
 * Definição de template de etiqueta
 */
export interface LabelTemplateDefinition {
  /** ID único do template */
  id: string;

  /** Nome de exibição */
  name: string;

  /** Descrição */
  description?: string;

  /** URL da thumbnail */
  thumbnailUrl?: string;

  /** Dimensões da etiqueta em mm */
  dimensions: {
    width: number;
    height: number;
  };

  /** Se é um template do sistema (não pode ser editado) */
  isSystem: boolean;

  /** Dados do GrapesJS (para templates customizados) */
  grapesJsData?: string;

  /** Componente React (para templates do sistema) */
  component?: React.ComponentType<{ data: LabelData }>;

  /** Campos disponíveis para este template */
  availableFields: LabelField[];

  /** Data de criação */
  createdAt: Date;

  /** Data de última modificação */
  updatedAt?: Date;
}

// ============================================
// LABEL DATA
// ============================================

/**
 * Dados resolvidos para renderização da etiqueta
 */
export interface LabelData {
  // Informações do fabricante
  manufacturerName: string;

  // Informações de localização
  stockLocation: string;
  warehouseCode?: string;
  zoneName?: string;
  binAddress?: string;

  // Informações do produto
  productName: string;
  productCode: string;
  productDescription?: string;

  // Informações da variante
  variantName: string;
  variantCode: string;
  variantSku?: string;
  variantReference?: string;
  variantBarcode?: string;

  // Informações do item
  itemCode: string;
  itemUid: string;
  itemId: string;
  itemQuantity: number;
  itemUnitOfMeasure: string;
  itemBatchNumber?: string;

  // Campos combinados
  productVariantName: string; // "Produto - Variante"
  referenceVariantName: string; // "REF-123 - Variante"

  // Atributos marcados para impressão
  productAttributes: Record<string, unknown>;
  variantAttributes: Record<string, unknown>;
  itemAttributes: Record<string, unknown>;

  // Dados para códigos
  barcodeData: string;
  qrCodeData: string;
}

// ============================================
// CONTEXT TYPES
// ============================================

/**
 * Ações disponíveis na fila de impressão
 */
export interface PrintQueueActions {
  /** Adicionar item(s) à fila */
  addToQueue: (items: AddToQueueInput | AddToQueueInput[]) => void;

  /** Remover item da fila por queueId */
  removeFromQueue: (queueId: string) => void;

  /** Atualizar número de cópias */
  updateCopies: (queueId: string, copies: number) => void;

  /** Reordenar itens na fila */
  reorderQueue: (queueIds: string[]) => void;

  /** Limpar toda a fila */
  clearQueue: () => void;

  /** Atualizar configurações de página */
  updatePageSettings: (settings: Partial<PageSettings>) => void;

  /** Selecionar template */
  selectTemplate: (
    templateId: string,
    dimensions?: { width: number; height: number }
  ) => void;

  /** Verificar se item está na fila */
  isInQueue: (entityId: string) => boolean;

  /** Obter item da fila por ID da entidade */
  getQueueItem: (entityId: string) => PrintQueueItem | undefined;
}

/**
 * Valor do contexto da fila de impressão
 */
export interface PrintQueueContextValue {
  /** Estado atual da fila */
  state: PrintQueueState;

  /** Número de itens na fila */
  itemCount: number;

  /** Total de etiquetas (incluindo cópias) */
  totalLabels: number;

  /** Se a fila tem itens */
  hasItems: boolean;

  /** Se está hidratado do localStorage */
  isHydrated: boolean;

  /** Ações disponíveis */
  actions: PrintQueueActions;
}

// ============================================
// PRINTING TYPES
// ============================================

/**
 * Status da geração de PDF
 */
export type PrintGenerationStatus = 'idle' | 'generating' | 'success' | 'error';

/**
 * Resultado da geração de PDF
 */
export interface PrintGenerationResult {
  status: PrintGenerationStatus;
  progress: number;
  pdfBlob?: Blob;
  pdfUrl?: string;
  error?: Error;
}

/**
 * Opções de impressão
 */
export interface PrintOptions {
  /** Abrir diálogo de impressão automaticamente */
  autoOpenPrintDialog?: boolean;

  /** Nome do arquivo para download */
  filename?: string;
}

// ============================================
// PAGE LAYOUT TYPES
// ============================================

/**
 * Posição de uma etiqueta na página
 */
export interface LabelPosition {
  /** Índice da etiqueta (0-based) */
  index: number;

  /** Posição X em mm */
  x: number;

  /** Posição Y em mm */
  y: number;

  /** Largura em mm */
  width: number;

  /** Altura em mm */
  height: number;

  /** Número da página (0-based) */
  page: number;

  /** Linha na página */
  row: number;

  /** Coluna na página */
  column: number;
}

/**
 * Layout de uma página
 */
export interface PageLayout {
  /** Índice da página (0-based) */
  pageIndex: number;

  /** Etiquetas nesta página */
  labels: Array<{
    position: LabelPosition;
    data: LabelData;
  }>;
}

/**
 * Layout calculado completo
 */
export interface CalculatedLayout {
  /** Número total de páginas */
  totalPages: number;

  /** Número total de etiquetas */
  totalLabels: number;

  /** Etiquetas por página */
  labelsPerPage: number;

  /** Páginas com suas etiquetas */
  pages: PageLayout[];

  /** Dimensões do papel em mm */
  paperDimensions: {
    width: number;
    height: number;
  };

  /** Dimensões de cada etiqueta em mm */
  labelDimensions: {
    width: number;
    height: number;
  };
}
