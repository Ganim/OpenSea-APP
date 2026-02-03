/**
 * Sistema de Impressão - Templates Registry
 *
 * Registro centralizado de todos os templates disponíveis
 */

import { ClothingLabelTemplate } from '../templates/ClothingLabelTemplate';
import { ItemLabelTemplate } from '../templates/ItemLabelTemplate';
import { ReportTemplate } from '../templates/ReportTemplate';
import {
  ClothingLabelData,
  ItemLabelData,
  PrintFormat,
  PrintOrientation,
  PrintTemplate,
  ReportData,
  TemplateType,
} from '../types';

/**
 * Template de Etiqueta de Item (100x100mm)
 */
export const ITEM_LABEL_TEMPLATE: PrintTemplate<ItemLabelData> = {
  id: 'item-label-100x100',
  name: 'Etiqueta de Item',
  description: 'Etiqueta padrão para identificação de produtos (100x100mm)',
  type: TemplateType.ITEM_LABEL,
  format: PrintFormat.LABEL_100X100,
  orientation: PrintOrientation.PORTRAIT,
  component: ItemLabelTemplate,
  defaultConfig: {
    format: PrintFormat.LABEL_100X100,
    orientation: PrintOrientation.PORTRAIT,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
};

/**
 * Template de Etiqueta de Roupa (33x55mm)
 */
export const CLOTHING_LABEL_TEMPLATE: PrintTemplate<ClothingLabelData> = {
  id: 'clothing-label-33x55',
  name: 'Etiqueta de Roupa',
  description: 'Etiqueta para roupas com instruções de cuidado (33x55mm)',
  type: TemplateType.CLOTHING_LABEL,
  format: PrintFormat.LABEL_33X55,
  orientation: PrintOrientation.PORTRAIT,
  component: ClothingLabelTemplate,
  defaultConfig: {
    format: PrintFormat.LABEL_33X55,
    orientation: PrintOrientation.PORTRAIT,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
};

/**
 * Template Genérico de Relatório A4
 */
export const REPORT_TEMPLATE: PrintTemplate<ReportData> = {
  id: 'report-a4-generic',
  name: 'Relatório Genérico',
  description: 'Template flexível para relatórios customizáveis (A4)',
  type: TemplateType.REPORT,
  format: PrintFormat.A4,
  orientation: PrintOrientation.PORTRAIT,
  component: ReportTemplate,
  defaultConfig: {
    format: PrintFormat.A4,
    orientation: PrintOrientation.PORTRAIT,
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
};

/**
 * Registro de todos os templates
 */
export const PRINT_TEMPLATES = {
  ITEM_LABEL: ITEM_LABEL_TEMPLATE,
  CLOTHING_LABEL: CLOTHING_LABEL_TEMPLATE,
  REPORT: REPORT_TEMPLATE,
} as const;

/**
 * Obtém template por ID
 */
export const getTemplateById = (id: string): PrintTemplate | undefined => {
  return Object.values(PRINT_TEMPLATES).find(template => template.id === id);
};

/**
 * Obtém templates por tipo
 */
export const getTemplatesByType = (type: TemplateType): PrintTemplate[] => {
  return Object.values(PRINT_TEMPLATES).filter(
    template => template.type === type
  );
};

/**
 * Lista todos os templates
 */
export const getAllTemplates = (): PrintTemplate[] => {
  return Object.values(PRINT_TEMPLATES);
};
