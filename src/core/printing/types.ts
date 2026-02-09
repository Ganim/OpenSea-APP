/**
 * Sistema de Impressão - Tipos TypeScript
 *
 * Define todos os tipos e interfaces para o sistema de impressão
 */

// ==================== CONFIGURAÇÕES DE IMPRESSÃO ====================

export enum PrintFormat {
  A4 = 'A4',
  LABEL_100X100 = 'LABEL_100X100', // Etiqueta de item
  LABEL_33X55 = 'LABEL_33X55', // Etiqueta de roupa (3 por linha)
  CUSTOM = 'CUSTOM',
}

export enum PrintOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export enum PrintOutputType {
  PDF = 'pdf',
  DIRECT_PRINT = 'direct_print',
  PREVIEW = 'preview',
}

export interface PrintDimensions {
  width: number; // em mm
  height: number; // em mm
}

export interface PrintConfig {
  format: PrintFormat;
  orientation: PrintOrientation;
  dimensions?: PrintDimensions; // Para formatos customizados
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  outputType: PrintOutputType;
}

// ==================== ETIQUETA DE ITEM ====================

export interface ItemLabelData {
  // Informações do produto
  manufacturer: string;
  stockLocation: string;
  product: string;
  code: string;
  composition: string;
  quality?: string;
  color: string;
  nuance?: string;

  // Dimensões e especificações
  dimensions: string; // Ex: "L: 1,62m"
  grammage: string; // Ex: "260 g/m²"

  // Identificação da peça
  pieceId: string;
  quantity: string;

  // Código de barras
  barcode: string;

  // Metadados
  printedAt?: Date;
  printedBy?: string;
}

// ==================== ETIQUETA DE ROUPA ====================

export type CareInstruction =
  | '40' // Lavar a 40°C
  | 'no-bleach' // Não alvejar
  | 'no-dryer' // Não secar em secadora
  | 'iron-low' // Passar com ferro baixo
  | 'no-dry-clean'; // Não lavar a seco

export interface ClothingLabelData {
  brand: string;
  reference: string;
  composition: string; // Pode ter quebras de linha
  careInstructions: CareInstruction[];
  size: string;
  madeIn: string;
  barcode?: string;
  price?: string;
  color?: string;
}

// ==================== RELATÓRIOS ====================

export interface ReportConfig {
  title: string;
  subtitle?: string;
  generatedAt?: Date;
  generatedBy?: string;
  logo?: string; // URL ou base64
  footer?: string;
}

export interface TableColumn {
  header: string;
  accessor: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
}

export interface ReportTableData {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
}

export interface ReportImageData {
  src: string;
  alt?: string;
  maxHeight?: string;
  caption?: string;
}

export type ReportSectionData =
  | ReportTableData
  | ReportImageData
  | Record<string, unknown>;

export interface ReportData extends ReportConfig {
  sections: ReportSection[];
}

export interface ReportSection {
  type: 'text' | 'table' | 'image' | 'custom';
  title?: string;
  content?: string;
  data?: ReportSectionData;
}

// ==================== SISTEMA DE TEMPLATES ====================

export enum TemplateType {
  ITEM_LABEL = 'ITEM_LABEL',
  CLOTHING_LABEL = 'CLOTHING_LABEL',
  REPORT = 'REPORT',
  CUSTOM = 'CUSTOM',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PrintTemplate<T = any> {
  id: string;
  name: string;
  description?: string;
  type: TemplateType;
  format: PrintFormat;
  orientation: PrintOrientation;
  component: React.ComponentType<{ data: T }>;
  defaultConfig?: Partial<PrintConfig>;
}

// ==================== HOOKS E UTILIDADES ====================

export interface UsePrintOptions {
  template: PrintTemplate;
  data: unknown;
  config?: Partial<PrintConfig>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface PrintResult {
  success: boolean;
  error?: Error;
  pdfUrl?: string;
}

// ==================== PREVIEW ====================

export interface PrintPreviewProps {
  template: PrintTemplate;
  data: unknown;
  config?: PrintConfig;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  onClose?: () => void;
}

// ==================== BATCH PRINTING ====================

export interface BatchPrintItem {
  id: string;
  data: unknown;
  copies?: number;
}

export interface BatchPrintConfig {
  template: PrintTemplate;
  items: BatchPrintItem[];
  config?: PrintConfig;
  outputType: PrintOutputType;
}
