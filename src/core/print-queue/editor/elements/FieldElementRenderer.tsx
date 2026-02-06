'use client';

/**
 * Label Studio - Field Element Renderer
 * Renderiza elementos de campo de dados (simple, composite, conditional, calculated)
 */

import React from 'react';
import type { FieldElement, TextStyle } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';
import { FileText, Braces, GitBranch, Calculator } from 'lucide-react';

interface FieldElementRendererProps {
  element: FieldElement;
  zoom: number;
  /** Dados reais para preview (quando disponíveis) */
  previewData?: Record<string, unknown>;
}

/**
 * Data Paths disponíveis organizados por categoria
 */
export const DATA_PATHS = {
  product: {
    label: 'Produto',
    fields: [
      { path: 'product.name', label: 'Nome', example: 'Camiseta Básica' },
      { path: 'product.sku', label: 'SKU', example: 'CAM-001' },
      { path: 'product.code', label: 'Código', example: 'P001' },
      { path: 'product.description', label: 'Descrição', example: 'Camiseta 100% algodão' },
      { path: 'product.brand', label: 'Marca', example: 'BasicWear' },
      { path: 'product.category', label: 'Categoria', example: 'Vestuário' },
    ],
  },
  variant: {
    label: 'Variante',
    fields: [
      { path: 'variant.name', label: 'Nome', example: 'P / Branca' },
      { path: 'variant.sku', label: 'SKU', example: 'CAM-001-P-BR' },
      { path: 'variant.barcode', label: 'Código de Barras', example: '7891234567890' },
      { path: 'variant.price', label: 'Preço', example: 'R$ 49,90' },
      { path: 'variant.costPrice', label: 'Preço de Custo', example: 'R$ 25,00' },
      { path: 'variant.weight', label: 'Peso', example: '0.2 kg' },
    ],
  },
  item: {
    label: 'Item',
    fields: [
      { path: 'item.uid', label: 'UID', example: 'ITM-2024-001' },
      { path: 'item.status', label: 'Status', example: 'AVAILABLE' },
      { path: 'item.batchNumber', label: 'Lote', example: 'LOT-2024-A' },
      { path: 'item.expirationDate', label: 'Validade', example: '2025-12-31' },
      { path: 'item.receivedAt', label: 'Recebido em', example: '2024-01-15' },
      { path: 'item.lastKnownAddress', label: 'Endereço', example: 'A-01-03-02' },
    ],
  },
  location: {
    label: 'Localização',
    fields: [
      { path: 'item.bin.zone.name', label: 'Zona', example: 'Prateleira A' },
      { path: 'item.bin.zone.warehouse.name', label: 'Armazém', example: 'Centro de Distribuição' },
      { path: 'item.bin.aisle', label: 'Corredor', example: '1' },
      { path: 'item.bin.shelf', label: 'Prateleira', example: '3' },
      { path: 'item.bin.position', label: 'Posição', example: '2' },
    ],
  },
  tenant: {
    label: 'Empresa',
    fields: [
      { path: 'tenant.name', label: 'Nome', example: 'Empresa Demo' },
      { path: 'tenant.cnpj', label: 'CNPJ', example: '12.345.678/0001-90' },
    ],
  },
  meta: {
    label: 'Meta',
    fields: [
      { path: 'meta.printDate', label: 'Data de Impressão', example: '06/02/2026' },
      { path: 'meta.printTime', label: 'Hora de Impressão', example: '14:30' },
      { path: 'meta.printedBy', label: 'Impresso por', example: 'Admin' },
      { path: 'meta.sequenceNumber', label: 'Nº Sequencial', example: '001' },
    ],
  },
} as const;

/**
 * Obtém o valor de exemplo para um dataPath
 */
function getExampleValue(dataPath: string): string {
  for (const category of Object.values(DATA_PATHS)) {
    for (const field of category.fields) {
      if (field.path === dataPath) {
        return field.example;
      }
    }
  }
  return dataPath || 'valor';
}

/**
 * Obtém o label amigável para um dataPath
 */
export function getFieldLabel(dataPath: string): string {
  for (const category of Object.values(DATA_PATHS)) {
    for (const field of category.fields) {
      if (field.path === dataPath) {
        return field.label;
      }
    }
  }
  return dataPath.split('.').pop() || 'Campo';
}

/**
 * Resolve um template composto substituindo placeholders
 */
function resolveCompositeTemplate(
  template: string,
  previewData?: Record<string, unknown>
): string {
  return template.replace(/\{([^}]+)\}/g, (match, path) => {
    if (previewData) {
      const value = resolvePath(previewData, path);
      if (value != null) return String(value);
    }
    return getExampleValue(path);
  });
}

/**
 * Resolve um caminho em um objeto
 */
function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Ícone para o tipo de campo
 */
function FieldTypeIcon({ type }: { type: FieldElement['fieldConfig']['type'] }) {
  const iconClass = 'w-3 h-3';
  switch (type) {
    case 'simple':
      return <FileText className={iconClass} />;
    case 'composite':
      return <Braces className={iconClass} />;
    case 'conditional':
      return <GitBranch className={iconClass} />;
    case 'calculated':
      return <Calculator className={iconClass} />;
  }
}

/**
 * Gera o valor de preview do campo
 */
function getPreviewValue(
  fieldConfig: FieldElement['fieldConfig'],
  previewData?: Record<string, unknown>
): string {
  switch (fieldConfig.type) {
    case 'simple':
      if (previewData && fieldConfig.dataPath) {
        const value = resolvePath(previewData, fieldConfig.dataPath);
        if (value != null) return String(value);
      }
      return getExampleValue(fieldConfig.dataPath || '');

    case 'composite':
      if (fieldConfig.template) {
        return resolveCompositeTemplate(fieldConfig.template, previewData);
      }
      return '{campo1} - {campo2}';

    case 'conditional':
      if (fieldConfig.conditions) {
        if (previewData) {
          const primary = resolvePath(previewData, fieldConfig.conditions.primary);
          if (primary) return String(primary);
          for (const fallback of fieldConfig.conditions.fallbacks) {
            const value = resolvePath(previewData, fallback);
            if (value) return String(value);
          }
        }
        return getExampleValue(fieldConfig.conditions.primary);
      }
      return 'valor condicional';

    case 'calculated':
      if (fieldConfig.formula) {
        // No preview, mostra a fórmula
        return `= ${fieldConfig.formula}`;
      }
      return '= fórmula';
  }
}

/**
 * Renderiza elemento de campo
 */
export function FieldElementRenderer({
  element,
  zoom,
  previewData,
}: FieldElementRendererProps) {
  const { fieldConfig, label, valueStyle } = element;

  const previewValue = getPreviewValue(fieldConfig, previewData);
  const valueFontSizePx = mmToPx(valueStyle.fontSize, zoom);

  // Estilo do valor
  const valueStyleCSS: React.CSSProperties = {
    fontFamily: valueStyle.fontFamily,
    fontSize: valueFontSizePx,
    fontWeight: valueStyle.fontWeight,
    fontStyle: valueStyle.fontStyle,
    color: valueStyle.color,
    backgroundColor: valueStyle.backgroundColor,
    textAlign: valueStyle.textAlign,
    lineHeight: valueStyle.lineHeight,
    letterSpacing: valueStyle.letterSpacing,
    textTransform: valueStyle.textTransform,
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    flex: 1,
    display: 'flex',
    alignItems:
      valueStyle.verticalAlign === 'top'
        ? 'flex-start'
        : valueStyle.verticalAlign === 'bottom'
          ? 'flex-end'
          : 'center',
  };

  // Se tem label
  const hasLabel = label?.enabled;
  const isLabelAbove = label?.position === 'above';

  // Estilo do label
  const labelFontSizePx = label?.style?.fontSize
    ? mmToPx(label.style.fontSize, zoom)
    : valueFontSizePx * 0.75;

  const labelStyleCSS: React.CSSProperties = label
    ? {
        fontFamily: label.style?.fontFamily || valueStyle.fontFamily,
        fontSize: labelFontSizePx,
        fontWeight: label.style?.fontWeight || 'bold',
        color: label.style?.color || '#666666',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...(isLabelAbove
          ? { marginBottom: mmToPx(0.5, zoom) }
          : { marginRight: mmToPx(1, zoom), minWidth: 'fit-content' }),
      }
    : {};

  // Indicador do tipo (badge no canto)
  const showTypeIndicator = !fieldConfig.dataPath && fieldConfig.type === 'simple';

  return (
    <div
      className="w-full h-full flex"
      style={{
        flexDirection: isLabelAbove ? 'column' : 'row',
        padding: mmToPx(0.5, zoom),
      }}
    >
      {/* Label do campo */}
      {hasLabel && label && (
        <div style={labelStyleCSS}>
          {label.text || getFieldLabel(fieldConfig.dataPath || '')}
        </div>
      )}

      {/* Valor do campo */}
      <div style={valueStyleCSS}>
        <span>{previewValue}</span>
      </div>

      {/* Badge indicador de tipo (design time) */}
      <div
        className="absolute top-0 right-0 flex items-center gap-0.5 px-1 py-0.5 bg-blue-500 text-white rounded-bl"
        style={{ fontSize: Math.max(8, mmToPx(1.5, zoom)) }}
      >
        <FieldTypeIcon type={fieldConfig.type} />
      </div>

      {/* Indicador de campo vazio */}
      {showTypeIndicator && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-blue-50/80 border border-dashed border-blue-300 text-blue-500"
          style={{ fontSize: mmToPx(2, zoom) }}
        >
          Selecione um campo
        </div>
      )}
    </div>
  );
}

export default FieldElementRenderer;
