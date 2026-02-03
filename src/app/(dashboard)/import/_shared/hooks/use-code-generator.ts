// ============================================
// USE CODE GENERATOR HOOK
// Hook React para geração de códigos hierárquicos
// ============================================

import { useCallback, useMemo } from 'react';
import {
  generateProductCode,
  generateVariantCode,
  generateItemCode,
  generateProductCodes,
  generateVariantCodes,
  generateItemCodes,
  type ProductCodeInput,
  type VariantCodeInput,
  type ItemCodeInput,
  type BatchCodeResult,
} from '../utils/code-generator';
import {
  validateCodeFormat,
  parseProductCode,
  parseVariantCode,
  parseItemCode,
} from '../config/code-patterns';

// ============================================
// TYPES
// ============================================

export interface UseCodeGeneratorReturn {
  // Geradores individuais
  generateProductCode: (input: ProductCodeInput) => string;
  generateVariantCode: (input: VariantCodeInput) => string;
  generateItemCode: (input: ItemCodeInput) => string;

  // Geradores em lote
  generateProductCodes: (
    products: Array<{ templateCode: string; manufacturerCode: string }>,
    startSequential?: number
  ) => BatchCodeResult[];
  generateVariantCodes: (
    variants: Array<{ colorRef: string }>,
    productContext: {
      templateCode: string;
      manufacturerCode: string;
      productSequentialCode: number;
    },
    startSequential?: number
  ) => BatchCodeResult[];
  generateItemCodes: (
    count: number,
    variantCode: string,
    startSequential?: number
  ) => BatchCodeResult[];

  // Validadores
  validateProductCode: (code: string) => boolean;
  validateVariantCode: (code: string) => boolean;
  validateItemCode: (code: string) => boolean;

  // Parsers
  parseProductCode: (code: string) => ReturnType<typeof parseProductCode>;
  parseVariantCode: (code: string) => ReturnType<typeof parseVariantCode>;
  parseItemCode: (code: string) => ReturnType<typeof parseItemCode>;

  // Utilitários
  previewProductCode: (
    templateCode: string,
    manufacturerCode: string,
    sequential?: number
  ) => string;
  previewVariantCode: (
    templateCode: string,
    manufacturerCode: string,
    productSeq: number,
    colorRef: string,
    variantSeq?: number
  ) => string;
  previewItemCode: (variantCode: string, itemSeq?: number) => string;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useCodeGenerator(): UseCodeGeneratorReturn {
  // ============================================
  // INDIVIDUAL GENERATORS
  // ============================================

  const generateProductCodeFn = useCallback(
    (input: ProductCodeInput): string => {
      return generateProductCode(input);
    },
    []
  );

  const generateVariantCodeFn = useCallback(
    (input: VariantCodeInput): string => {
      return generateVariantCode(input);
    },
    []
  );

  const generateItemCodeFn = useCallback((input: ItemCodeInput): string => {
    return generateItemCode(input);
  }, []);

  // ============================================
  // BATCH GENERATORS
  // ============================================

  const generateProductCodesFn = useCallback(
    (
      products: Array<{ templateCode: string; manufacturerCode: string }>,
      startSequential: number = 1
    ): BatchCodeResult[] => {
      return generateProductCodes(products, startSequential);
    },
    []
  );

  const generateVariantCodesFn = useCallback(
    (
      variants: Array<{ colorRef: string }>,
      productContext: {
        templateCode: string;
        manufacturerCode: string;
        productSequentialCode: number;
      },
      startSequential: number = 1
    ): BatchCodeResult[] => {
      return generateVariantCodes(variants, productContext, startSequential);
    },
    []
  );

  const generateItemCodesFn = useCallback(
    (
      count: number,
      variantCode: string,
      startSequential: number = 1
    ): BatchCodeResult[] => {
      return generateItemCodes(count, variantCode, startSequential);
    },
    []
  );

  // ============================================
  // VALIDATORS
  // ============================================

  const validateProductCodeFn = useCallback((code: string): boolean => {
    return validateCodeFormat(code, 'product');
  }, []);

  const validateVariantCodeFn = useCallback((code: string): boolean => {
    return validateCodeFormat(code, 'variant');
  }, []);

  const validateItemCodeFn = useCallback((code: string): boolean => {
    return validateCodeFormat(code, 'item');
  }, []);

  // ============================================
  // PREVIEW GENERATORS (for UI display)
  // ============================================

  const previewProductCode = useCallback(
    (
      templateCode: string,
      manufacturerCode: string,
      sequential: number = 1
    ): string => {
      if (!templateCode || !manufacturerCode) {
        return '---';
      }
      return generateProductCode({
        templateCode,
        manufacturerCode,
        sequentialCode: sequential,
      });
    },
    []
  );

  const previewVariantCode = useCallback(
    (
      templateCode: string,
      manufacturerCode: string,
      productSeq: number,
      colorRef: string,
      variantSeq: number = 1
    ): string => {
      if (!templateCode || !manufacturerCode || !colorRef) {
        return '---';
      }
      return generateVariantCode({
        templateCode,
        manufacturerCode,
        productSequentialCode: productSeq,
        colorRef,
        variantSequentialCode: variantSeq,
      });
    },
    []
  );

  const previewItemCode = useCallback(
    (variantCode: string, itemSeq: number = 1): string => {
      if (!variantCode) {
        return '---';
      }
      return generateItemCode({
        variantCode,
        itemSequentialCode: itemSeq,
      });
    },
    []
  );

  // ============================================
  // RETURN
  // ============================================

  return useMemo(
    () => ({
      // Geradores individuais
      generateProductCode: generateProductCodeFn,
      generateVariantCode: generateVariantCodeFn,
      generateItemCode: generateItemCodeFn,

      // Geradores em lote
      generateProductCodes: generateProductCodesFn,
      generateVariantCodes: generateVariantCodesFn,
      generateItemCodes: generateItemCodesFn,

      // Validadores
      validateProductCode: validateProductCodeFn,
      validateVariantCode: validateVariantCodeFn,
      validateItemCode: validateItemCodeFn,

      // Parsers
      parseProductCode,
      parseVariantCode,
      parseItemCode,

      // Preview
      previewProductCode,
      previewVariantCode,
      previewItemCode,
    }),
    [
      generateProductCodeFn,
      generateVariantCodeFn,
      generateItemCodeFn,
      generateProductCodesFn,
      generateVariantCodesFn,
      generateItemCodesFn,
      validateProductCodeFn,
      validateVariantCodeFn,
      validateItemCodeFn,
      previewProductCode,
      previewVariantCode,
      previewItemCode,
    ]
  );
}

// ============================================
// EXAMPLES / DOCUMENTATION
// ============================================

/**
 * Exemplos de uso:
 *
 * ```tsx
 * const { generateProductCode, previewVariantCode } = useCodeGenerator();
 *
 * // Gerar código de produto
 * const productCode = generateProductCode({
 *   templateCode: 'TEC',
 *   manufacturerCode: 'SAN',
 *   sequentialCode: 1,
 * });
 * // Resultado: "TEC.SAN.0001"
 *
 * // Preview de variante (para exibir no form)
 * const variantPreview = previewVariantCode('TEC', 'SAN', 1, 'J29', 1);
 * // Resultado: "TS0001.J29.01"
 *
 * // Gerar códigos em lote
 * const productCodes = generateProductCodes([
 *   { templateCode: 'TEC', manufacturerCode: 'SAN' },
 *   { templateCode: 'TEC', manufacturerCode: 'CED' },
 * ], 1);
 * // Resultado: [
 * //   { index: 0, code: 'TEC.SAN.0001', entityType: 'product' },
 * //   { index: 1, code: 'TEC.CED.0002', entityType: 'product' },
 * // ]
 *
 * // Gerar variantes para um produto
 * const variantCodes = generateVariantCodes(
 *   [{ colorRef: 'J29' }, { colorRef: 'L16' }],
 *   { templateCode: 'TEC', manufacturerCode: 'SAN', productSequentialCode: 1 },
 *   1
 * );
 * // Resultado: [
 * //   { index: 0, code: 'TS0001.J29.01', entityType: 'variant' },
 * //   { index: 1, code: 'TS0001.L16.02', entityType: 'variant' },
 * // ]
 *
 * // Gerar items para uma variante
 * const itemCodes = generateItemCodes(3, 'TS0001.J29.01', 1);
 * // Resultado: [
 * //   { index: 0, code: 'TS0001.J29.01-0001', entityType: 'item' },
 * //   { index: 1, code: 'TS0001.J29.01-0002', entityType: 'item' },
 * //   { index: 2, code: 'TS0001.J29.01-0003', entityType: 'item' },
 * // ]
 * ```
 */
