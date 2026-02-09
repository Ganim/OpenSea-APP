/**
 * Extrai atributos imprimíveis de templates de produto
 * para uso no editor de etiquetas (Label Studio)
 */

import type { Template, TemplateAttributes } from '@/types/stock';
import type { DataFieldCategory, DataField } from '../elements/FieldElementRenderer';

/**
 * Níveis de atributos suportados
 */
const ATTRIBUTE_LEVELS = [
  {
    key: 'productAttributes' as const,
    categoryId: 'dynamic_product_attributes',
    label: 'Atr. de Produto',
    icon: 'Package',
    pathPrefix: 'product.attributes',
  },
  {
    key: 'variantAttributes' as const,
    categoryId: 'dynamic_variant_attributes',
    label: 'Atr. de Variante',
    icon: 'Palette',
    pathPrefix: 'variant.attributes',
  },
  {
    key: 'itemAttributes' as const,
    categoryId: 'dynamic_item_attributes',
    label: 'Atr. de Item',
    icon: 'Box',
    pathPrefix: 'item.attributes',
  },
] as const;

/**
 * Gera valor de exemplo baseado no tipo do atributo
 */
function getExampleByType(type: string, label: string): string {
  switch (type) {
    case 'number':
      return '0';
    case 'boolean':
      return 'Sim';
    case 'date':
      return '01/01/2026';
    case 'select':
      return label;
    case 'string':
    default:
      return label;
  }
}

/**
 * Capitaliza a primeira letra de cada palavra
 */
function capitalizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Extrai atributos com enablePrint:true de um TemplateAttributes
 * Retorna DataField[] deduplicado por chave
 */
function extractFieldsFromAttributes(
  attrs: TemplateAttributes,
  pathPrefix: string,
  seen: Set<string>
): DataField[] {
  const fields: DataField[] = [];

  for (const [key, attr] of Object.entries(attrs)) {
    if (!attr.enablePrint) continue;
    if (seen.has(key)) continue;
    seen.add(key);

    const label = attr.label || capitalizeKey(key);
    fields.push({
      path: `${pathPrefix}.${key}`,
      label,
      example: getExampleByType(attr.type, label),
    });
  }

  return fields;
}

/**
 * Extrai atributos imprimíveis de todos os templates
 * e retorna DataFieldCategory[] para uso no FieldPickerModal
 *
 * @param templates - Array de templates de produto
 * @returns Até 3 categorias (Atr. de Produto, Atr. de Variante, Atr. de Item),
 *          apenas categorias com pelo menos 1 campo imprimível são retornadas
 */
export function extractPrintableAttributes(
  templates: Template[]
): DataFieldCategory[] {
  const categories: DataFieldCategory[] = [];

  for (const level of ATTRIBUTE_LEVELS) {
    const seen = new Set<string>();
    const allFields: DataField[] = [];

    for (const template of templates) {
      const attrs = template[level.key];
      if (!attrs) continue;
      const fields = extractFieldsFromAttributes(attrs, level.pathPrefix, seen);
      allFields.push(...fields);
    }

    if (allFields.length > 0) {
      categories.push({
        id: level.categoryId,
        label: level.label,
        icon: level.icon,
        fields: allFields,
      });
    }
  }

  return categories;
}
