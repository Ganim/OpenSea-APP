// ============================================
// USE CATALOG IMPORT HOOK
// Estado principal do wizard de importação de catálogo
// ============================================

import { useState, useCallback, useMemo } from 'react';
import type { ParsedSheet } from '../../_shared/utils/excel-parser';
import type { Template, Manufacturer } from '@/types/stock';

// ============================================
// TYPES
// ============================================

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface ColumnMapping {
  /** Mapeamento: coluna do arquivo → campo do produto */
  product: Record<string, string>;
  /** Mapeamento: coluna do arquivo → campo da variante */
  variant: Record<string, string>;
  /** Coluna usada para agrupar variantes (nome do produto) */
  groupingColumn: string;
}

export interface GroupedProduct {
  /** Identificador temporário para o grupo */
  tempId: string;
  /** Dados do produto */
  productData: Record<string, unknown>;
  /** Variantes do produto */
  variants: Array<{
    tempId: string;
    data: Record<string, unknown>;
    rowIndex: number;
  }>;
  /** Índices das linhas originais */
  rowNumbers: number[];
  /** Erros de validação */
  errors: ValidationError[];
  /** Avisos */
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'product' | 'variant';
  field: string;
  message: string;
  rowIndex?: number;
}

export interface ValidationWarning {
  type: 'product' | 'variant';
  field: string;
  message: string;
  rowIndex?: number;
}

export interface ValidationResult {
  valid: boolean;
  totalProducts: number;
  totalVariants: number;
  validProducts: number;
  invalidProducts: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  manufacturersToCreate: ManufacturerToCreate[];
  manufacturersExisting: Manufacturer[];
}

export interface ManufacturerToCreate {
  cnpj: string;
  name?: string;
  apiData?: Record<string, unknown>;
  error?: string;
}

export interface ImportProgress {
  status:
    | 'idle'
    | 'importing'
    | 'paused'
    | 'completed'
    | 'failed'
    | 'cancelled';
  totalProducts: number;
  totalVariants: number;
  importedProducts: number;
  importedVariants: number;
  failedProducts: number;
  failedVariants: number;
  currentProduct?: string;
  errors: Array<{
    productName: string;
    message: string;
    rowIndex?: number;
  }>;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CatalogImportState {
  step: WizardStep;
  file: File | null;
  parsedSheet: ParsedSheet | null;
  selectedSheetIndex: number;
  template: Template | null;
  columnMapping: ColumnMapping;
  groupedProducts: GroupedProduct[];
  validationResult: ValidationResult | null;
  importProgress: ImportProgress;
}

export interface UseCatalogImportReturn {
  // Estado
  state: CatalogImportState;
  step: WizardStep;
  canGoNext: boolean;
  canGoBack: boolean;

  // Navegação
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1: Upload
  setFile: (file: File | null) => void;
  setParsedSheet: (sheet: ParsedSheet | null) => void;
  setSelectedSheetIndex: (index: number) => void;

  // Step 2: Template
  setTemplate: (template: Template | null) => void;

  // Step 3: Mapping
  setColumnMapping: (mapping: ColumnMapping) => void;
  updateProductMapping: (fileColumn: string, systemField: string) => void;
  updateVariantMapping: (fileColumn: string, systemField: string) => void;
  setGroupingColumn: (column: string) => void;
  clearMapping: () => void;

  // Step 4: Preview
  setGroupedProducts: (products: GroupedProduct[]) => void;

  // Step 5: Validation
  setValidationResult: (result: ValidationResult | null) => void;

  // Step 6: Import
  setImportProgress: (progress: ImportProgress) => void;
  updateImportProgress: (update: Partial<ImportProgress>) => void;

  // Reset
  reset: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialColumnMapping: ColumnMapping = {
  product: {},
  variant: {},
  groupingColumn: '',
};

const initialImportProgress: ImportProgress = {
  status: 'idle',
  totalProducts: 0,
  totalVariants: 0,
  importedProducts: 0,
  importedVariants: 0,
  failedProducts: 0,
  failedVariants: 0,
  errors: [],
};

const initialState: CatalogImportState = {
  step: 1,
  file: null,
  parsedSheet: null,
  selectedSheetIndex: 0,
  template: null,
  columnMapping: initialColumnMapping,
  groupedProducts: [],
  validationResult: null,
  importProgress: initialImportProgress,
};

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useCatalogImport(): UseCatalogImportReturn {
  const [state, setState] = useState<CatalogImportState>(initialState);

  // ============================================
  // NAVIGATION
  // ============================================

  const canGoNext = useMemo(() => {
    switch (state.step) {
      case 1:
        return state.parsedSheet !== null && state.parsedSheet.rows.length > 0;
      case 2:
        return state.template !== null;
      case 3:
        return (
          state.columnMapping.groupingColumn !== '' &&
          Object.keys(state.columnMapping.product).length > 0
        );
      case 4:
        return state.groupedProducts.length > 0;
      case 5:
        return state.validationResult !== null && state.validationResult.valid;
      case 6:
        return state.importProgress.status === 'completed';
      default:
        return false;
    }
  }, [state]);

  const canGoBack =
    state.step > 1 && state.importProgress.status !== 'importing';

  const goToStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (prev.step < 6) {
        return { ...prev, step: (prev.step + 1) as WizardStep };
      }
      return prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => {
      if (prev.step > 1) {
        return { ...prev, step: (prev.step - 1) as WizardStep };
      }
      return prev;
    });
  }, []);

  // ============================================
  // STEP 1: UPLOAD
  // ============================================

  const setFile = useCallback((file: File | null) => {
    setState(prev => ({
      ...prev,
      file,
      // Reset dependent state when file changes
      parsedSheet: null,
      selectedSheetIndex: 0,
      template: null,
      columnMapping: initialColumnMapping,
      groupedProducts: [],
      validationResult: null,
      importProgress: initialImportProgress,
    }));
  }, []);

  const setParsedSheet = useCallback((sheet: ParsedSheet | null) => {
    setState(prev => ({
      ...prev,
      parsedSheet: sheet,
      // Reset mapping when sheet changes
      columnMapping: initialColumnMapping,
      groupedProducts: [],
      validationResult: null,
    }));
  }, []);

  const setSelectedSheetIndex = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      selectedSheetIndex: index,
    }));
  }, []);

  // ============================================
  // STEP 2: TEMPLATE
  // ============================================

  const setTemplate = useCallback((template: Template | null) => {
    setState(prev => ({
      ...prev,
      template,
      // Reset mapping when template changes
      columnMapping: initialColumnMapping,
      groupedProducts: [],
      validationResult: null,
    }));
  }, []);

  // ============================================
  // STEP 3: MAPPING
  // ============================================

  const setColumnMapping = useCallback((mapping: ColumnMapping) => {
    setState(prev => ({
      ...prev,
      columnMapping: mapping,
      // Reset dependent state
      groupedProducts: [],
      validationResult: null,
    }));
  }, []);

  const updateProductMapping = useCallback(
    (fileColumn: string, systemField: string) => {
      setState(prev => ({
        ...prev,
        columnMapping: {
          ...prev.columnMapping,
          product: {
            ...prev.columnMapping.product,
            [fileColumn]: systemField,
          },
        },
        groupedProducts: [],
        validationResult: null,
      }));
    },
    []
  );

  const updateVariantMapping = useCallback(
    (fileColumn: string, systemField: string) => {
      setState(prev => ({
        ...prev,
        columnMapping: {
          ...prev.columnMapping,
          variant: {
            ...prev.columnMapping.variant,
            [fileColumn]: systemField,
          },
        },
        groupedProducts: [],
        validationResult: null,
      }));
    },
    []
  );

  const setGroupingColumn = useCallback((column: string) => {
    setState(prev => ({
      ...prev,
      columnMapping: {
        ...prev.columnMapping,
        groupingColumn: column,
      },
      groupedProducts: [],
      validationResult: null,
    }));
  }, []);

  const clearMapping = useCallback(() => {
    setState(prev => ({
      ...prev,
      columnMapping: initialColumnMapping,
      groupedProducts: [],
      validationResult: null,
    }));
  }, []);

  // ============================================
  // STEP 4: PREVIEW
  // ============================================

  const setGroupedProducts = useCallback((products: GroupedProduct[]) => {
    setState(prev => ({
      ...prev,
      groupedProducts: products,
      validationResult: null,
    }));
  }, []);

  // ============================================
  // STEP 5: VALIDATION
  // ============================================

  const setValidationResult = useCallback((result: ValidationResult | null) => {
    setState(prev => ({
      ...prev,
      validationResult: result,
    }));
  }, []);

  // ============================================
  // STEP 6: IMPORT
  // ============================================

  const setImportProgress = useCallback((progress: ImportProgress) => {
    setState(prev => ({
      ...prev,
      importProgress: progress,
    }));
  }, []);

  const updateImportProgress = useCallback(
    (update: Partial<ImportProgress>) => {
      setState(prev => ({
        ...prev,
        importProgress: {
          ...prev.importProgress,
          ...update,
        },
      }));
    },
    []
  );

  // ============================================
  // RESET
  // ============================================

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // ============================================
  // RETURN
  // ============================================

  return useMemo(
    () => ({
      state,
      step: state.step,
      canGoNext,
      canGoBack,

      goToStep,
      nextStep,
      prevStep,

      setFile,
      setParsedSheet,
      setSelectedSheetIndex,

      setTemplate,

      setColumnMapping,
      updateProductMapping,
      updateVariantMapping,
      setGroupingColumn,
      clearMapping,

      setGroupedProducts,

      setValidationResult,

      setImportProgress,
      updateImportProgress,

      reset,
    }),
    [
      state,
      canGoNext,
      canGoBack,
      goToStep,
      nextStep,
      prevStep,
      setFile,
      setParsedSheet,
      setSelectedSheetIndex,
      setTemplate,
      setColumnMapping,
      updateProductMapping,
      updateVariantMapping,
      setGroupingColumn,
      clearMapping,
      setGroupedProducts,
      setValidationResult,
      setImportProgress,
      updateImportProgress,
      reset,
    ]
  );
}
