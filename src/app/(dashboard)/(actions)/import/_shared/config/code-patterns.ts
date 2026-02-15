// ============================================
// CODE PATTERNS CONFIGURATION
// Sistema de codificação hierárquico para produtos, variantes e items
// ============================================

// ============================================
// TYPES
// ============================================

export type CodeSegmentType =
  | 'template'
  | 'manufacturer'
  | 'category'
  | 'attribute'
  | 'sequential'
  | 'reference'; // referência a outro código (ex: variant.code)

export interface CodeSegment {
  /** Tipo do segmento */
  type: CodeSegmentType;
  /** Campo de origem dos dados (ex: "template.code", "attributes.colorRef") */
  source?: string;
  /** Tamanho do segmento (para padding) */
  length?: number;
  /** Caractere para padding à esquerda */
  padChar?: string;
  /** Prefixo fixo */
  prefix?: string;
  /** Converter para maiúsculo */
  uppercase?: boolean;
  /** Usar apenas primeira letra (abreviação) */
  abbreviate?: boolean;
  /** Separador após este segmento */
  separator?: string;
}

export interface CodePattern {
  /** Tipo de entidade */
  entityType: 'product' | 'variant' | 'item';
  /** Descrição do padrão */
  description: string;
  /** Exemplo do código gerado */
  example: string;
  /** Segmentos que compõem o código */
  segments: CodeSegment[];
  /** Separador padrão entre segmentos */
  defaultSeparator: string;
}

// ============================================
// CODE PATTERNS
// ============================================

/**
 * Padrão de código para PRODUTOS
 * Formato: TEC.SAN.0001
 * - TPL (3 chars): Código do template (uppercase)
 * - MFR (3 chars): Código do fabricante (uppercase)
 * - SEQ (4 chars): Sequencial do produto (zero-padded)
 */
export const PRODUCT_CODE_PATTERN: CodePattern = {
  entityType: 'product',
  description: 'Código hierárquico: Template.Fabricante.Sequencial',
  example: 'TEC.SAN.0001',
  defaultSeparator: '.',
  segments: [
    {
      type: 'template',
      source: 'template.code',
      length: 3,
      uppercase: true,
      separator: '.',
    },
    {
      type: 'manufacturer',
      source: 'manufacturer.code',
      length: 3,
      uppercase: true,
      separator: '.',
    },
    {
      type: 'sequential',
      length: 4,
      padChar: '0',
    },
  ],
};

/**
 * Padrão de código para VARIANTES
 * Formato: TS0001.J29.01
 * - TPL_ABBR (1 char): Primeira letra do template
 * - MFR_ABBR (1 char): Primeira letra do fabricante
 * - PROD_SEQ (4 chars): Sequencial do produto pai
 * - COLOR_REF (variable): Referência da cor (ex: J29, L16)
 * - VAR_SEQ (2 chars): Sequencial da variante
 */
export const VARIANT_CODE_PATTERN: CodePattern = {
  entityType: 'variant',
  description:
    'Código compacto: AbrevTemplate+Fabricante+ProdSeq.RefCor.VarSeq',
  example: 'TS0001.J29.01',
  defaultSeparator: '.',
  segments: [
    {
      type: 'template',
      source: 'template.code',
      length: 1,
      abbreviate: true,
      uppercase: true,
    },
    {
      type: 'manufacturer',
      source: 'manufacturer.code',
      length: 1,
      abbreviate: true,
      uppercase: true,
    },
    {
      type: 'reference',
      source: 'product.sequentialCode',
      length: 4,
      padChar: '0',
      separator: '.',
    },
    {
      type: 'attribute',
      source: 'attributes.colorRef',
      uppercase: true,
      separator: '.',
    },
    {
      type: 'sequential',
      length: 2,
      padChar: '0',
    },
  ],
};

/**
 * Padrão de código para ITEMS
 * Formato: TS0001.J29.01-0001
 * - VARIANT_CODE: Código completo da variante
 * - ITEM_SEQ (4 chars): Sequencial do item
 */
export const ITEM_CODE_PATTERN: CodePattern = {
  entityType: 'item',
  description: 'Código do item: VarianteCode-ItemSeq',
  example: 'TS0001.J29.01-0001',
  defaultSeparator: '-',
  segments: [
    {
      type: 'reference',
      source: 'variant.code',
      separator: '-',
    },
    {
      type: 'sequential',
      length: 4,
      padChar: '0',
    },
  ],
};

// ============================================
// PATTERN REGISTRY
// ============================================

export const CODE_PATTERNS: Record<string, CodePattern> = {
  product: PRODUCT_CODE_PATTERN,
  variant: VARIANT_CODE_PATTERN,
  item: ITEM_CODE_PATTERN,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtém o padrão de código para uma entidade
 */
export function getCodePattern(
  entityType: 'product' | 'variant' | 'item'
): CodePattern {
  return CODE_PATTERNS[entityType];
}

/**
 * Valida se um código segue o padrão esperado
 */
export function validateCodeFormat(
  code: string,
  entityType: 'product' | 'variant' | 'item'
): boolean {
  const patterns: Record<string, RegExp> = {
    // TEC.SAN.0001
    product: /^[A-Z]{3}\.[A-Z]{3}\.\d{4}$/,
    // TS0001.J29.01
    variant: /^[A-Z]{2}\d{4}\.[A-Z0-9]+\.\d{2}$/,
    // TS0001.J29.01-0001
    item: /^[A-Z]{2}\d{4}\.[A-Z0-9]+\.\d{2}-\d{4}$/,
  };

  return patterns[entityType]?.test(code) ?? false;
}

/**
 * Extrai informações de um código de produto
 * TEC.SAN.0001 -> { template: 'TEC', manufacturer: 'SAN', sequential: 1 }
 */
export function parseProductCode(code: string): {
  template: string;
  manufacturer: string;
  sequential: number;
} | null {
  const match = code.match(/^([A-Z]{3})\.([A-Z]{3})\.(\d{4})$/);
  if (!match) return null;

  return {
    template: match[1],
    manufacturer: match[2],
    sequential: parseInt(match[3], 10),
  };
}

/**
 * Extrai informações de um código de variante
 * TS0001.J29.01 -> { templateAbbr: 'T', mfrAbbr: 'S', productSeq: 1, colorRef: 'J29', variantSeq: 1 }
 */
export function parseVariantCode(code: string): {
  templateAbbr: string;
  mfrAbbr: string;
  productSeq: number;
  colorRef: string;
  variantSeq: number;
} | null {
  const match = code.match(/^([A-Z])([A-Z])(\d{4})\.([A-Z0-9]+)\.(\d{2})$/);
  if (!match) return null;

  return {
    templateAbbr: match[1],
    mfrAbbr: match[2],
    productSeq: parseInt(match[3], 10),
    colorRef: match[4],
    variantSeq: parseInt(match[5], 10),
  };
}

/**
 * Extrai informações de um código de item
 * TS0001.J29.01-0001 -> { variantCode: 'TS0001.J29.01', itemSeq: 1 }
 */
export function parseItemCode(code: string): {
  variantCode: string;
  itemSeq: number;
} | null {
  const match = code.match(/^(.+)-(\d{4})$/);
  if (!match) return null;

  return {
    variantCode: match[1],
    itemSeq: parseInt(match[2], 10),
  };
}
