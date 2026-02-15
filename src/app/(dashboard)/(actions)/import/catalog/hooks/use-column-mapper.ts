// ============================================
// USE COLUMN MAPPER HOOK
// Hook para mapeamento de colunas do arquivo para campos do sistema
// ============================================

import { useMemo, useCallback } from 'react';
import type { Template, TemplateAttribute } from '@/types/stock';
import type { ColumnMapping } from './use-catalog-import';

// ============================================
// TYPES
// ============================================

export interface SystemField {
  key: string;
  label: string;
  required: boolean;
  type: 'product' | 'variant';
  source: 'system' | 'template';
  dataType: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'reference';
  description?: string;
  options?: string[];
}

export interface MappingSuggestion {
  fileColumn: string;
  systemField: SystemField;
  confidence: number; // 0-1
  reason: string;
}

export interface ColumnMapperReturn {
  // Campos do sistema
  productFields: SystemField[];
  variantFields: SystemField[];
  allFields: SystemField[];

  // Sugestões automáticas
  getSuggestions: (fileColumns: string[]) => MappingSuggestion[];
  autoMap: (fileColumns: string[]) => Partial<ColumnMapping>;

  // Validação
  validateMapping: (
    mapping: ColumnMapping,
    fileColumns: string[]
  ) => { valid: boolean; missingRequired: string[]; warnings: string[] };

  // Campos não mapeados
  getUnmappedFileColumns: (
    mapping: ColumnMapping,
    fileColumns: string[]
  ) => string[];
  getUnmappedSystemFields: (mapping: ColumnMapping) => SystemField[];
}

// ============================================
// CAMPOS FIXOS DO SISTEMA
// ============================================

const FIXED_PRODUCT_FIELDS: SystemField[] = [
  {
    key: 'name',
    label: 'Nome do Produto',
    required: true,
    type: 'product',
    source: 'system',
    dataType: 'text',
    description: 'Nome do produto (obrigatório)',
  },
  {
    key: 'description',
    label: 'Descrição',
    required: false,
    type: 'product',
    source: 'system',
    dataType: 'text',
    description: 'Descrição detalhada do produto',
  },
  {
    key: 'manufacturerCnpj',
    label: 'CNPJ Fabricante',
    required: false,
    type: 'product',
    source: 'system',
    dataType: 'text',
    description: 'CNPJ do fabricante (busca automática via BrasilAPI)',
  },
  {
    key: 'supplierCnpj',
    label: 'CNPJ Fornecedor',
    required: false,
    type: 'product',
    source: 'system',
    dataType: 'text',
    description: 'CNPJ do fornecedor (busca automática via BrasilAPI)',
  },
];

const FIXED_VARIANT_FIELDS: SystemField[] = [
  {
    key: 'name',
    label: 'Nome da Variante',
    required: true,
    type: 'variant',
    source: 'system',
    dataType: 'text',
    description: 'Nome da variante (ex: Azul P, Vermelho M)',
  },
  {
    key: 'sku',
    label: 'SKU',
    required: false,
    type: 'variant',
    source: 'system',
    dataType: 'text',
    description: 'Código SKU da variante',
  },
  {
    key: 'price',
    label: 'Preço',
    required: false,
    type: 'variant',
    source: 'system',
    dataType: 'number',
    description: 'Preço de venda',
  },
  {
    key: 'costPrice',
    label: 'Preço de Custo',
    required: false,
    type: 'variant',
    source: 'system',
    dataType: 'number',
    description: 'Preço de custo',
  },
  {
    key: 'barcode',
    label: 'Código de Barras',
    required: false,
    type: 'variant',
    source: 'system',
    dataType: 'text',
    description: 'Código de barras EAN/UPC',
  },
  {
    key: 'colorHex',
    label: 'Cor (Hex)',
    required: false,
    type: 'variant',
    source: 'system',
    dataType: 'text',
    description: 'Cor em formato hexadecimal (#RRGGBB)',
  },
  {
    key: 'colorPantone',
    label: 'Cor (Pantone)',
    required: false,
    type: 'variant',
    source: 'system',
    dataType: 'text',
    description: 'Código de cor Pantone',
  },
  {
    key: 'reference',
    label: 'Referência',
    required: false,
    type: 'variant',
    source: 'system',
    dataType: 'text',
    description: 'Referência da variante (ex: J29, L16)',
  },
  {
    key: 'minStock',
    label: 'Estoque Mínimo',
    required: false,
    type: 'variant',
    source: 'system',
    dataType: 'number',
    description: 'Quantidade mínima em estoque',
  },
  {
    key: 'maxStock',
    label: 'Estoque Máximo',
    required: false,
    type: 'variant',
    source: 'system',
    dataType: 'number',
    description: 'Quantidade máxima em estoque',
  },
];

// ============================================
// MAPEAMENTO DE SINÔNIMOS PARA AUTO-DETECÇÃO
// ============================================

const COLUMN_SYNONYMS: Record<string, string[]> = {
  // Produto
  'product.name': [
    'nome do produto',
    'produto',
    'product name',
    'name',
    'titulo',
    'título',
    'artigo',
  ],
  'product.description': ['descrição', 'descricao', 'description', 'desc'],
  'product.manufacturerCnpj': [
    'cnpj fabricante',
    'cnpj fab',
    'fabricante cnpj',
    'manufacturer cnpj',
    'cnpj marca',
    'marca cnpj',
  ],
  'product.supplierCnpj': [
    'cnpj fornecedor',
    'cnpj forn',
    'fornecedor cnpj',
    'supplier cnpj',
  ],

  // Variante
  'variant.name': [
    'nome cor',
    'cor',
    'nome da cor',
    'nome variante',
    'variante',
    'variant name',
    'color name',
  ],
  'variant.sku': ['sku', 'codigo', 'código', 'code', 'ref'],
  'variant.price': ['preço', 'preco', 'price', 'valor', 'venda'],
  'variant.costPrice': [
    'custo',
    'preço custo',
    'preco custo',
    'cost',
    'cost price',
  ],
  'variant.barcode': [
    'ean',
    'upc',
    'codigo barras',
    'código de barras',
    'barcode',
    'gtin',
  ],
  'variant.colorHex': [
    'hexadecimal',
    'hex',
    'cor hex',
    'color hex',
    'html color',
  ],
  'variant.colorPantone': ['pantone', 'cor pantone', 'pantone color'],
  'variant.reference': [
    'referencia',
    'referência',
    'ref cor',
    'reference',
    'color ref',
    'cod cor',
    'código cor',
  ],
  'variant.minStock': [
    'estoque minimo',
    'estoque mínimo',
    'min stock',
    'est min',
  ],
  'variant.maxStock': [
    'estoque maximo',
    'estoque máximo',
    'max stock',
    'est max',
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Simple word overlap
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;

  return intersection / union;
}

function templateAttributeToSystemField(
  key: string,
  attr: TemplateAttribute,
  type: 'product' | 'variant'
): SystemField {
  return {
    key: `attributes.${key}`,
    label: attr.label || key,
    required: attr.required || false,
    type,
    source: 'template',
    dataType: attr.type === 'string' ? 'text' : attr.type,
    description: attr.description,
    options: attr.options,
  };
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useColumnMapper(template: Template | null): ColumnMapperReturn {
  // ============================================
  // CAMPOS DO SISTEMA
  // ============================================

  const productFields = useMemo((): SystemField[] => {
    const fields = [...FIXED_PRODUCT_FIELDS];

    // Adicionar atributos do template
    if (template?.productAttributes) {
      Object.entries(template.productAttributes).forEach(([key, attr]) => {
        fields.push(templateAttributeToSystemField(key, attr, 'product'));
      });
    }

    return fields;
  }, [template]);

  const variantFields = useMemo((): SystemField[] => {
    const fields = [...FIXED_VARIANT_FIELDS];

    // Adicionar atributos do template
    if (template?.variantAttributes) {
      Object.entries(template.variantAttributes).forEach(([key, attr]) => {
        fields.push(templateAttributeToSystemField(key, attr, 'variant'));
      });
    }

    return fields;
  }, [template]);

  const allFields = useMemo(
    () => [...productFields, ...variantFields],
    [productFields, variantFields]
  );

  // ============================================
  // SUGESTÕES AUTOMÁTICAS
  // ============================================

  const getSuggestions = useCallback(
    (fileColumns: string[]): MappingSuggestion[] => {
      const suggestions: MappingSuggestion[] = [];

      for (const fileColumn of fileColumns) {
        const normalizedColumn = normalizeText(fileColumn);
        let bestMatch: MappingSuggestion | null = null;
        let bestScore = 0;

        // Verificar sinônimos primeiro
        for (const [fieldPath, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
          for (const synonym of synonyms) {
            const similarity = calculateSimilarity(normalizedColumn, synonym);
            if (similarity > bestScore && similarity >= 0.6) {
              const [type, key] = fieldPath.split('.') as [
                'product' | 'variant',
                string,
              ];
              const field = allFields.find(
                f =>
                  f.type === type &&
                  (f.key === key || f.key === `attributes.${key}`)
              );
              if (field) {
                bestScore = similarity;
                bestMatch = {
                  fileColumn,
                  systemField: field,
                  confidence: similarity,
                  reason: `Correspondência com "${synonym}"`,
                };
              }
            }
          }
        }

        // Se não encontrou por sinônimos, tentar correspondência direta
        if (!bestMatch) {
          for (const field of allFields) {
            const fieldName = field.key.replace('attributes.', '');
            const similarity = Math.max(
              calculateSimilarity(normalizedColumn, fieldName),
              calculateSimilarity(normalizedColumn, field.label)
            );
            if (similarity > bestScore && similarity >= 0.5) {
              bestScore = similarity;
              bestMatch = {
                fileColumn,
                systemField: field,
                confidence: similarity,
                reason: `Correspondência com "${field.label}"`,
              };
            }
          }
        }

        if (bestMatch) {
          suggestions.push(bestMatch);
        }
      }

      return suggestions.sort((a, b) => b.confidence - a.confidence);
    },
    [allFields]
  );

  const autoMap = useCallback(
    (fileColumns: string[]): Partial<ColumnMapping> => {
      const suggestions = getSuggestions(fileColumns);
      const mapping: Partial<ColumnMapping> = {
        product: {},
        variant: {},
        groupingColumn: '',
      };

      const usedSystemFields = new Set<string>();

      for (const suggestion of suggestions) {
        if (suggestion.confidence < 0.6) continue;

        const fieldKey = `${suggestion.systemField.type}.${suggestion.systemField.key}`;
        if (usedSystemFields.has(fieldKey)) continue;

        if (suggestion.systemField.type === 'product') {
          mapping.product![suggestion.fileColumn] = suggestion.systemField.key;
        } else {
          mapping.variant![suggestion.fileColumn] = suggestion.systemField.key;
        }

        usedSystemFields.add(fieldKey);
      }

      // Tentar detectar coluna de agrupamento
      const groupingCandidates = [
        'nome do produto',
        'produto',
        'product',
        'name',
        'artigo',
      ];
      for (const column of fileColumns) {
        const normalized = normalizeText(column);
        if (groupingCandidates.some(c => normalized.includes(c))) {
          mapping.groupingColumn = column;
          break;
        }
      }

      return mapping;
    },
    [getSuggestions]
  );

  // ============================================
  // VALIDAÇÃO
  // ============================================

  const validateMapping = useCallback(
    (
      mapping: ColumnMapping,
      fileColumns: string[]
    ): { valid: boolean; missingRequired: string[]; warnings: string[] } => {
      const missingRequired: string[] = [];
      const warnings: string[] = [];

      // Verificar campos obrigatórios de produto
      const mappedProductFields = new Set(Object.values(mapping.product));
      for (const field of productFields) {
        if (field.required && !mappedProductFields.has(field.key)) {
          missingRequired.push(`Produto: ${field.label}`);
        }
      }

      // Verificar campos obrigatórios de variante
      const mappedVariantFields = new Set(Object.values(mapping.variant));
      for (const field of variantFields) {
        if (field.required && !mappedVariantFields.has(field.key)) {
          missingRequired.push(`Variante: ${field.label}`);
        }
      }

      // Verificar coluna de agrupamento
      if (!mapping.groupingColumn) {
        missingRequired.push('Coluna de agrupamento (Nome do Produto)');
      } else if (!fileColumns.includes(mapping.groupingColumn)) {
        warnings.push(
          `Coluna de agrupamento "${mapping.groupingColumn}" não existe no arquivo`
        );
      }

      // Verificar se há mapeamentos para colunas que não existem
      for (const fileColumn of Object.keys(mapping.product)) {
        if (!fileColumns.includes(fileColumn)) {
          warnings.push(`Coluna mapeada "${fileColumn}" não existe no arquivo`);
        }
      }
      for (const fileColumn of Object.keys(mapping.variant)) {
        if (!fileColumns.includes(fileColumn)) {
          warnings.push(`Coluna mapeada "${fileColumn}" não existe no arquivo`);
        }
      }

      return {
        valid: missingRequired.length === 0,
        missingRequired,
        warnings,
      };
    },
    [productFields, variantFields]
  );

  // ============================================
  // CAMPOS NÃO MAPEADOS
  // ============================================

  const getUnmappedFileColumns = useCallback(
    (mapping: ColumnMapping, fileColumns: string[]): string[] => {
      const mappedColumns = new Set([
        ...Object.keys(mapping.product),
        ...Object.keys(mapping.variant),
        mapping.groupingColumn,
      ]);
      return fileColumns.filter(c => !mappedColumns.has(c));
    },
    []
  );

  const getUnmappedSystemFields = useCallback(
    (mapping: ColumnMapping): SystemField[] => {
      const mappedProductFields = new Set(Object.values(mapping.product));
      const mappedVariantFields = new Set(Object.values(mapping.variant));

      return allFields.filter(field => {
        if (field.type === 'product') {
          return !mappedProductFields.has(field.key);
        }
        return !mappedVariantFields.has(field.key);
      });
    },
    [allFields]
  );

  // ============================================
  // RETURN
  // ============================================

  return useMemo(
    () => ({
      productFields,
      variantFields,
      allFields,
      getSuggestions,
      autoMap,
      validateMapping,
      getUnmappedFileColumns,
      getUnmappedSystemFields,
    }),
    [
      productFields,
      variantFields,
      allFields,
      getSuggestions,
      autoMap,
      validateMapping,
      getUnmappedFileColumns,
      getUnmappedSystemFields,
    ]
  );
}
