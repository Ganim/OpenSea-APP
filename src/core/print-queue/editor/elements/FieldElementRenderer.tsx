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

// ============================================
// TIPOS DO FIELD REGISTRY
// ============================================

export interface DataField {
  path: string;
  label: string;
  example: string;
  description?: string;
}

export interface DataFieldCategory {
  id: string;
  label: string;
  icon: string;
  fields: DataField[];
}

export type EntityType = 'item' | 'employee';

// ============================================
// ENTITY FIELD REGISTRIES
// ============================================

export const ENTITY_FIELD_REGISTRIES: Record<EntityType, DataFieldCategory[]> =
  {
    item: [
      {
        id: 'codes',
        label: 'Códigos',
        icon: 'Hash',
        fields: [
          {
            path: 'product.fullCode',
            label: 'Código do Produto',
            example: '5.1.1',
          },
          {
            path: 'variant.fullCode',
            label: 'Código da Variante',
            example: '5.1.1.2.901',
          },
          {
            path: 'item.fullCode',
            label: 'Código do Item',
            example: '5.1.1.2.901.23',
          },
          {
            path: 'item.barcode',
            label: 'Código de Barras (imagem)',
            example: '5112901230001',
            description: 'Renderiza como barcode',
          },
          {
            path: 'item.barcodeData',
            label: 'QR Code (imagem)',
            example: 'sample-item-id',
            description: 'Renderiza como QR code',
          },
        ],
      },
      {
        id: 'products',
        label: 'Produtos',
        icon: 'Package',
        fields: [
          {
            path: 'combined.templateProductVariant',
            label: 'Produto Completo',
            example: 'Malha Camiseta Básica Azul M',
            description: 'Template + Produto + Variante',
          },
          {
            path: 'combined.productVariant',
            label: 'Produto + Variante',
            example: 'Camiseta Básica Azul M',
          },
          {
            path: 'product.name',
            label: 'Nome do Produto',
            example: 'Camiseta Básica',
          },
          {
            path: 'variant.name',
            label: 'Nome da Variante',
            example: 'Azul M',
          },
          {
            path: 'variant.reference',
            label: 'Referência',
            example: 'REF-2024-001',
          },
          {
            path: 'combined.referenceVariant',
            label: 'Referência + Variante',
            example: 'REF-001 - Azul M',
          },
          {
            path: 'product.category',
            label: 'Categoria',
            example: 'Vestuário',
          },
          {
            path: 'product.manufacturer.name',
            label: 'Fabricante',
            example: 'Acme Corp',
          },
          {
            path: 'product.manufacturer.cnpj',
            label: 'CNPJ Fabricante',
            example: '12.345.678/0001-90',
          },
          { path: 'product.unit', label: 'Unidade (abrev.)', example: 'm' },
          {
            path: 'product.unitFull',
            label: 'Unidade (completa)',
            example: 'metros',
          },
        ],
      },
      {
        id: 'quantities',
        label: 'Quantidades',
        icon: 'Layers',
        fields: [
          {
            path: 'item.currentQuantity',
            label: 'Quantidade do Item',
            example: '10',
          },
          {
            path: 'item.quantityWithUnit',
            label: 'Qtd + Unidade (abrev.)',
            example: '10 m',
          },
          {
            path: 'item.quantityWithUnitFull',
            label: 'Qtd + Unidade (completa)',
            example: '10 metros',
          },
        ],
      },
      {
        id: 'prices',
        label: 'Preços',
        icon: 'DollarSign',
        fields: [
          { path: 'variant.price', label: 'Preço', example: 'R$ 49,90' },
          {
            path: 'variant.costPrice',
            label: 'Preço de Custo',
            example: 'R$ 25,00',
          },
        ],
      },
      {
        id: 'attributes',
        label: 'Atributos',
        icon: 'FileText',
        fields: [
          {
            path: 'variant.attributes.composicao',
            label: 'Composição',
            example: '100% Algodão',
          },
          {
            path: 'variant.attributes.cor',
            label: 'Cor',
            example: '901 - Azul',
          },
          {
            path: 'variant.attributes.gramatura',
            label: 'Gramatura',
            example: '260 g/m²',
          },
          {
            path: 'variant.attributes.dimensoes',
            label: 'Dimensões',
            example: 'L: 1,62m',
          },
          {
            path: 'variant.attributes.qualidade',
            label: 'Qualidade',
            example: 'Premium',
          },
          { path: 'variant.attributes.nuance', label: 'Nuance', example: '-' },
        ],
      },
      {
        id: 'location',
        label: 'Localização',
        icon: 'MapPin',
        fields: [
          {
            path: 'item.resolvedAddress',
            label: 'Endereço BIN',
            example: 'FAB-EST-101-B',
          },
          {
            path: 'item.bin.zone.name',
            label: 'Zona',
            example: 'Prateleira A',
          },
          {
            path: 'item.bin.zone.warehouse.name',
            label: 'Armazém',
            example: 'Centro de Distribuição',
          },
          { path: 'item.bin.aisle', label: 'Corredor', example: '1' },
          { path: 'item.bin.shelf', label: 'Prateleira', example: '3' },
          { path: 'item.bin.position', label: 'Posição', example: '2' },
          {
            path: 'item.lastKnownAddress',
            label: 'Último Endereço',
            example: 'A-01-03-02',
          },
        ],
      },
      {
        id: 'meta',
        label: 'Meta',
        icon: 'Info',
        fields: [
          {
            path: 'meta.printDate',
            label: 'Data de Impressão',
            example: '08/02/2026',
          },
          {
            path: 'meta.printTime',
            label: 'Hora de Impressão',
            example: '14:30',
          },
          { path: 'meta.printedBy', label: 'Impresso por', example: 'Admin' },
          {
            path: 'meta.sequenceNumber',
            label: 'Nº Sequencial',
            example: '001',
          },
        ],
      },
    ],
    employee: [
      {
        id: 'codes',
        label: 'Códigos',
        icon: 'Hash',
        fields: [
          { path: 'employee.fullCode', label: 'Matrícula', example: 'EMP-001' },
          {
            path: 'employee.barcode',
            label: 'Código de Barras (imagem)',
            example: 'EMP-001',
            description: 'Renderiza como barcode',
          },
          {
            path: 'employee.qrcode',
            label: 'QR Code (imagem)',
            example: 'sample-emp-id',
            description: 'Renderiza como QR code',
          },
        ],
      },
      {
        id: 'employee_info',
        label: 'Funcionário',
        icon: 'User',
        fields: [
          {
            path: 'employee.firstName',
            label: 'Primeiro Nome',
            example: 'João',
          },
          {
            path: 'employee.lastName',
            label: 'Sobrenome',
            example: 'da Silva',
          },
          {
            path: 'employee.fullName',
            label: 'Nome Completo',
            example: 'João da Silva',
          },
          { path: 'employee.cpf', label: 'CPF', example: '123.456.789-00' },
          {
            path: 'employee.position',
            label: 'Cargo',
            example: 'Analista de Estoque',
          },
          {
            path: 'employee.department',
            label: 'Departamento',
            example: 'Logística',
          },
          {
            path: 'employee.admission',
            label: 'Data de Admissão',
            example: '15/01/2024',
          },
        ],
      },
      {
        id: 'company',
        label: 'Empresa',
        icon: 'Building',
        fields: [
          {
            path: 'company.name',
            label: 'Nome da Empresa',
            example: 'Empresa Demo Ltda',
          },
          {
            path: 'company.cnpj',
            label: 'CNPJ',
            example: '12.345.678/0001-90',
          },
        ],
      },
      {
        id: 'meta',
        label: 'Meta',
        icon: 'Info',
        fields: [
          {
            path: 'meta.printDate',
            label: 'Data de Impressão',
            example: '08/02/2026',
          },
          {
            path: 'meta.printTime',
            label: 'Hora de Impressão',
            example: '14:30',
          },
          { path: 'meta.printedBy', label: 'Impresso por', example: 'Admin' },
          {
            path: 'meta.sequenceNumber',
            label: 'Nº Sequencial',
            example: '001',
          },
        ],
      },
    ],
  };

// ============================================
// BUILD SAMPLE PREVIEW DATA
// ============================================

/**
 * Constrói um objeto nested a partir do ENTITY_FIELD_REGISTRIES
 * para uso como previewData com dados de amostra
 */
export function buildSamplePreviewData(
  entityType: EntityType = 'item'
): Record<string, unknown> {
  const categories = ENTITY_FIELD_REGISTRIES[entityType] || [];
  const data: Record<string, unknown> = {};
  for (const cat of categories) {
    for (const field of cat.fields) {
      const parts = field.path.split('.');
      let current = data;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]] as Record<string, unknown>;
      }
      current[parts[parts.length - 1]] = field.example;
    }
  }
  return data;
}

// ============================================
// BACKWARD COMPAT: DATA_PATHS derivado
// ============================================

function buildDataPathsFromRegistry() {
  const result: Record<
    string,
    {
      label: string;
      fields: { path: string; label: string; example: string }[];
    }
  > = {};
  for (const category of ENTITY_FIELD_REGISTRIES.item) {
    result[category.id] = {
      label: category.label,
      fields: category.fields.map(f => ({
        path: f.path,
        label: f.label,
        example: f.example,
      })),
    };
  }
  return result;
}

/**
 * @deprecated Use ENTITY_FIELD_REGISTRIES instead
 */
export const DATA_PATHS = buildDataPathsFromRegistry();

// ============================================
// HELPERS
// ============================================

/**
 * Obtém o valor de exemplo para um dataPath
 */
export function getExampleValue(
  dataPath: string,
  entityType?: EntityType
): string {
  const categories = ENTITY_FIELD_REGISTRIES[entityType || 'item'];
  for (const category of categories) {
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
export function getFieldLabel(
  dataPath: string,
  entityType?: EntityType
): string {
  const categories = ENTITY_FIELD_REGISTRIES[entityType || 'item'];
  for (const category of categories) {
    for (const field of category.fields) {
      if (field.path === dataPath) {
        return field.label;
      }
    }
  }
  // Fallback: último segmento capitalizado
  const lastSegment = dataPath.split('.').pop() || 'Campo';
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
}

// ============================================
// RENDERER INTERNALS
// ============================================

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
function FieldTypeIcon({
  type,
}: {
  type: FieldElement['fieldConfig']['type'];
}) {
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
 * Gera o placeholder do campo (quando previewData NÃO está ativo)
 * Mostra o label amigável entre {{ }} para indicar que é um campo dinâmico
 */
function getFieldPlaceholder(fieldConfig: FieldElement['fieldConfig']): string {
  switch (fieldConfig.type) {
    case 'simple':
      if (fieldConfig.dataPath) {
        return `{{${getFieldLabel(fieldConfig.dataPath)}}}`;
      }
      return '{{Campo}}';

    case 'composite':
      if (fieldConfig.template) {
        return fieldConfig.template.replace(/\{([^}]+)\}/g, (_, path) => {
          return `{{${getFieldLabel(path)}}}`;
        });
      }
      return '{{campo1}} - {{campo2}}';

    case 'conditional':
      if (fieldConfig.conditions) {
        return `{{${getFieldLabel(fieldConfig.conditions.primary)}}}`;
      }
      return '{{condicional}}';

    case 'calculated':
      if (fieldConfig.formula) {
        return `= ${fieldConfig.formula}`;
      }
      return '= fórmula';
  }
}

/**
 * Gera o valor de preview do campo (quando previewData ESTÁ ativo)
 * Resolve valores reais ou de exemplo a partir do previewData
 */
function getPreviewValue(
  fieldConfig: FieldElement['fieldConfig'],
  previewData?: Record<string, unknown>
): string {
  // Sem previewData → mostrar placeholder com label do campo
  if (!previewData) {
    return getFieldPlaceholder(fieldConfig);
  }

  // Com previewData → resolver valores
  switch (fieldConfig.type) {
    case 'simple':
      if (fieldConfig.dataPath) {
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
        const primary = resolvePath(
          previewData,
          fieldConfig.conditions.primary
        );
        if (primary) return String(primary);
        for (const fallback of fieldConfig.conditions.fallbacks) {
          const value = resolvePath(previewData, fallback);
          if (value) return String(value);
        }
        return getExampleValue(fieldConfig.conditions.primary);
      }
      return 'valor condicional';

    case 'calculated':
      if (fieldConfig.formula) {
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
  const showTypeIndicator =
    !fieldConfig.dataPath && fieldConfig.type === 'simple';

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
        <span
          style={{
            width: '100%',
            display: 'block',
            textAlign: valueStyle.textAlign,
          }}
        >
          {previewValue}
        </span>
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
