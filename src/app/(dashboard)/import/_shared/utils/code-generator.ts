// ============================================
// CODE GENERATOR UTILITY
// Gera códigos hierárquicos para produtos, variantes e items
// ============================================

import {
  type CodePattern,
  type CodeSegment,
  PRODUCT_CODE_PATTERN,
  VARIANT_CODE_PATTERN,
  ITEM_CODE_PATTERN,
} from '../config/code-patterns';

// ============================================
// TYPES
// ============================================

export interface ProductCodeInput {
  templateCode: string;
  manufacturerCode: string;
  sequentialCode: number;
}

export interface VariantCodeInput {
  templateCode: string;
  manufacturerCode: string;
  productSequentialCode: number;
  colorRef: string;
  variantSequentialCode: number;
}

export interface ItemCodeInput {
  variantCode: string;
  itemSequentialCode: number;
}

export interface CodeGeneratorContext {
  template?: { code: string; name?: string };
  manufacturer?: { code: string; name?: string };
  product?: { code?: string; sequentialCode: number };
  variant?: { code?: string; sequentialCode?: number };
  attributes?: Record<string, unknown>;
  sequentialCode?: number;
}

// ============================================
// CORE GENERATOR FUNCTIONS
// ============================================

/**
 * Gera código de PRODUTO
 * Formato: TEC.SAN.0001
 */
export function generateProductCode(input: ProductCodeInput): string {
  const { templateCode, manufacturerCode, sequentialCode } = input;

  const tpl = normalizeSegment(templateCode, 3, true);
  const mfr = normalizeSegment(manufacturerCode, 3, true);
  const seq = padNumber(sequentialCode, 4);

  return `${tpl}.${mfr}.${seq}`;
}

/**
 * Gera código de VARIANTE
 * Formato: TS0001.J29.01
 */
export function generateVariantCode(input: VariantCodeInput): string {
  const {
    templateCode,
    manufacturerCode,
    productSequentialCode,
    colorRef,
    variantSequentialCode,
  } = input;

  const tplAbbr = abbreviate(templateCode, 1, true);
  const mfrAbbr = abbreviate(manufacturerCode, 1, true);
  const prodSeq = padNumber(productSequentialCode, 4);
  const ref = colorRef.toUpperCase();
  const varSeq = padNumber(variantSequentialCode, 2);

  return `${tplAbbr}${mfrAbbr}${prodSeq}.${ref}.${varSeq}`;
}

/**
 * Gera código de ITEM
 * Formato: TS0001.J29.01-0001
 */
export function generateItemCode(input: ItemCodeInput): string {
  const { variantCode, itemSequentialCode } = input;

  const itemSeq = padNumber(itemSequentialCode, 4);

  return `${variantCode}-${itemSeq}`;
}

// ============================================
// GENERIC GENERATOR (Pattern-based)
// ============================================

/**
 * Gera código baseado em um padrão configurável
 */
export function generateCode(
  pattern: CodePattern,
  context: CodeGeneratorContext
): string {
  const parts: string[] = [];

  for (const segment of pattern.segments) {
    const value = resolveSegmentValue(segment, context);
    parts.push(value);
  }

  // Junta partes usando os separadores definidos em cada segmento
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    const segment = pattern.segments[i];
    if (i < parts.length - 1 && segment.separator) {
      result += segment.separator;
    }
  }

  return result;
}

/**
 * Resolve o valor de um segmento baseado no contexto
 */
function resolveSegmentValue(
  segment: CodeSegment,
  context: CodeGeneratorContext
): string {
  let value = '';

  switch (segment.type) {
    case 'template':
      value = getNestedValue(context, segment.source || 'template.code') || '';
      break;

    case 'manufacturer':
      value =
        getNestedValue(context, segment.source || 'manufacturer.code') || '';
      break;

    case 'category':
      value = getNestedValue(context, segment.source || 'category.code') || '';
      break;

    case 'attribute':
      value = getNestedValue(context, segment.source || '') || '';
      break;

    case 'reference':
      value = getNestedValue(context, segment.source || '') || '';
      break;

    case 'sequential':
      value = String(context.sequentialCode || 0);
      break;
  }

  // Aplicar transformações
  if (segment.abbreviate && segment.length) {
    value = abbreviate(value, segment.length, segment.uppercase);
  } else if (segment.length && segment.padChar) {
    value = value.padStart(segment.length, segment.padChar);
  } else if (segment.length && segment.type !== 'sequential') {
    value = normalizeSegment(value, segment.length, segment.uppercase);
  } else if (segment.type === 'sequential' && segment.length) {
    value = padNumber(parseInt(value, 10) || 0, segment.length);
  }

  if (segment.uppercase && !segment.abbreviate) {
    value = value.toUpperCase();
  }

  if (segment.prefix) {
    value = segment.prefix + value;
  }

  return value;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normaliza um segmento para o tamanho especificado
 */
function normalizeSegment(
  value: string,
  length: number,
  uppercase = false
): string {
  let result = value.trim();

  if (uppercase) {
    result = result.toUpperCase();
  }

  // Remove caracteres especiais e espaços
  result = result.replace(/[^A-Z0-9]/gi, '');

  // Trunca ou preenche para o tamanho desejado
  if (result.length > length) {
    result = result.substring(0, length);
  } else if (result.length < length) {
    result = result.padEnd(length, 'X');
  }

  return result;
}

/**
 * Abrevia uma string para N caracteres (primeiras letras)
 */
function abbreviate(value: string, length: number, uppercase = false): string {
  let result = value.trim();

  if (uppercase) {
    result = result.toUpperCase();
  }

  // Remove caracteres especiais
  result = result.replace(/[^A-Z0-9]/gi, '');

  return result.substring(0, length);
}

/**
 * Preenche número com zeros à esquerda
 */
function padNumber(num: number, length: number): string {
  return String(num).padStart(length, '0');
}

/**
 * Obtém valor de propriedade aninhada
 * Ex: getNestedValue(obj, 'template.code') -> obj.template.code
 */
function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return '';
    }
    if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }

  return current !== null && current !== undefined ? String(current) : '';
}

// ============================================
// CODE GENERATORS BY ENTITY TYPE
// ============================================

export const codeGenerators = {
  /**
   * Gera código de produto
   */
  product: (
    templateCode: string,
    manufacturerCode: string,
    sequentialCode: number
  ): string => {
    return generateProductCode({
      templateCode,
      manufacturerCode,
      sequentialCode,
    });
  },

  /**
   * Gera código de variante
   */
  variant: (
    templateCode: string,
    manufacturerCode: string,
    productSequentialCode: number,
    colorRef: string,
    variantSequentialCode: number
  ): string => {
    return generateVariantCode({
      templateCode,
      manufacturerCode,
      productSequentialCode,
      colorRef,
      variantSequentialCode,
    });
  },

  /**
   * Gera código de item
   */
  item: (variantCode: string, itemSequentialCode: number): string => {
    return generateItemCode({
      variantCode,
      itemSequentialCode,
    });
  },
};

// ============================================
// BATCH CODE GENERATION
// ============================================

export interface BatchCodeResult {
  index: number;
  code: string;
  entityType: 'product' | 'variant' | 'item';
}

/**
 * Gera códigos para múltiplos produtos
 */
export function generateProductCodes(
  products: Array<{
    templateCode: string;
    manufacturerCode: string;
  }>,
  startSequential: number = 1
): BatchCodeResult[] {
  return products.map((product, index) => ({
    index,
    code: generateProductCode({
      ...product,
      sequentialCode: startSequential + index,
    }),
    entityType: 'product' as const,
  }));
}

/**
 * Gera códigos para múltiplas variantes de um produto
 */
export function generateVariantCodes(
  variants: Array<{ colorRef: string }>,
  productContext: {
    templateCode: string;
    manufacturerCode: string;
    productSequentialCode: number;
  },
  startSequential: number = 1
): BatchCodeResult[] {
  return variants.map((variant, index) => ({
    index,
    code: generateVariantCode({
      ...productContext,
      colorRef: variant.colorRef,
      variantSequentialCode: startSequential + index,
    }),
    entityType: 'variant' as const,
  }));
}

/**
 * Gera códigos para múltiplos items de uma variante
 */
export function generateItemCodes(
  count: number,
  variantCode: string,
  startSequential: number = 1
): BatchCodeResult[] {
  return Array.from({ length: count }, (_, index) => ({
    index,
    code: generateItemCode({
      variantCode,
      itemSequentialCode: startSequential + index,
    }),
    entityType: 'item' as const,
  }));
}

// ============================================
// EXPORTS
// ============================================

export { PRODUCT_CODE_PATTERN, VARIANT_CODE_PATTERN, ITEM_CODE_PATTERN };
