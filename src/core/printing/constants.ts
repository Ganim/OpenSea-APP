/**
 * Sistema de Impressão - Constantes
 *
 * Define todas as constantes para formatos, dimensões e configurações
 */

import { PrintDimensions, PrintFormat } from './types';

// ==================== DIMENSÕES DE PÁGINA ====================

export const PAGE_DIMENSIONS: Record<PrintFormat, PrintDimensions> = {
  [PrintFormat.A4]: {
    width: 210, // mm
    height: 297, // mm
  },
  [PrintFormat.LABEL_100X100]: {
    width: 100, // mm
    height: 100, // mm
  },
  [PrintFormat.LABEL_33X55]: {
    width: 33, // mm
    height: 55, // mm
  },
  [PrintFormat.CUSTOM]: {
    width: 0,
    height: 0,
  },
};

// ==================== CONVERSÕES ====================

export const MM_TO_PX = 3.7795275591; // 1mm = 3.78 pixels (96 DPI)
export const MM_TO_PT = 2.83464567; // 1mm = 2.83 points

// ==================== CONFIGURAÇÕES PADRÃO ====================

export const DEFAULT_MARGINS = {
  A4: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  LABEL: {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
  },
};

// ==================== ESTILOS DE CÓDIGO DE BARRAS ====================

export const BARCODE_CONFIG = {
  ITEM_LABEL: {
    format: 'CODE128',
    width: 2,
    height: 40,
    displayValue: true,
    fontSize: 12,
    margin: 0,
  },
  CLOTHING_LABEL: {
    format: 'CODE128',
    width: 1.5,
    height: 30,
    displayValue: true,
    fontSize: 10,
    margin: 0,
  },
};

// ==================== CONFIGURAÇÕES DE QUALIDADE ====================

export const PDF_QUALITY = {
  LOW: {
    scale: 1,
    dpi: 72,
  },
  MEDIUM: {
    scale: 2,
    dpi: 150,
  },
  HIGH: {
    scale: 3,
    dpi: 300,
  },
  PRINT: {
    scale: 4,
    dpi: 600,
  },
};

// ==================== TEMPLATES IDS ====================

export const TEMPLATE_IDS = {
  ITEM_LABEL: 'item-label-standard',
  CLOTHING_LABEL: 'clothing-label-standard',
  INVENTORY_REPORT: 'inventory-report-standard',
  SALES_REPORT: 'sales-report-standard',
} as const;
