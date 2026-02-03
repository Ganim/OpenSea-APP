'use client';

import { useState, useCallback } from 'react';
import type {
  Template,
  CreateProductRequest,
  CreateVariantRequest,
  RegisterItemEntryRequest,
} from '@/types/stock';

export type WizardStep = 'template' | 'product' | 'variants' | 'stock';

export interface WizardVariant {
  id: string; // temporary id for UI
  name: string;
  sku?: string;
  price: number;
  costPrice?: number;
  attributes: Record<string, unknown>;
  barcode?: string;
  initialStock?: number;
  locationId?: string;
}

export interface WizardStockEntry {
  variantId: string;
  quantity: number;
  locationId?: string;
  unitCost?: number;
  lotNumber?: string;
  expirationDate?: string;
}

export interface WizardData {
  template: Template | null;
  product: CreateProductRequest | null;
  variants: WizardVariant[];
  stockEntries: WizardStockEntry[];
}

const INITIAL_DATA: WizardData = {
  template: null,
  product: null,
  variants: [],
  stockEntries: [],
};

const STEPS: WizardStep[] = ['template', 'product', 'variants', 'stock'];

export function useWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Navigation
  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    setErrors({});
  }, []);

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
      setErrors({});
    }
  }, [currentStepIndex, isLastStep]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
      setErrors({});
    }
  }, [currentStepIndex, isFirstStep]);

  // Data setters
  const setTemplate = useCallback((template: Template | null) => {
    setData(prev => ({ ...prev, template }));
  }, []);

  const setProduct = useCallback((product: CreateProductRequest | null) => {
    setData(prev => ({ ...prev, product }));
  }, []);

  const setVariants = useCallback((variants: WizardVariant[]) => {
    setData(prev => ({ ...prev, variants }));
  }, []);

  const addVariant = useCallback((variant: WizardVariant) => {
    setData(prev => ({ ...prev, variants: [...prev.variants, variant] }));
  }, []);

  const updateVariant = useCallback(
    (index: number, variant: Partial<WizardVariant>) => {
      setData(prev => ({
        ...prev,
        variants: prev.variants.map((v, i) =>
          i === index ? { ...v, ...variant } : v
        ),
      }));
    },
    []
  );

  const removeVariant = useCallback((index: number) => {
    setData(prev => {
      const variantToRemove = prev.variants[index];
      return {
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
        stockEntries: prev.stockEntries.filter(
          e => e.variantId !== variantToRemove?.id
        ),
      };
    });
  }, []);

  const setStockEntries = useCallback((entries: WizardData['stockEntries']) => {
    setData(prev => ({ ...prev, stockEntries: entries }));
  }, []);

  const updateStockEntry = useCallback(
    (variantId: string, entry: Partial<WizardStockEntry>) => {
      setData(prev => {
        const existingIndex = prev.stockEntries.findIndex(
          e => e.variantId === variantId
        );
        if (existingIndex >= 0) {
          return {
            ...prev,
            stockEntries: prev.stockEntries.map((e, i) =>
              i === existingIndex ? { ...e, ...entry } : e
            ),
          };
        } else {
          return {
            ...prev,
            stockEntries: [
              ...prev.stockEntries,
              { variantId, quantity: 0, ...entry },
            ],
          };
        }
      });
    },
    []
  );

  // Validation
  const validateStep = useCallback(
    (step: WizardStep): boolean => {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 'template':
          if (!data.template) {
            newErrors.template = 'Selecione um template';
          }
          break;

        case 'product':
          if (!data.product?.name) {
            newErrors.name = 'Nome do produto é obrigatório';
          }
          break;

        case 'variants':
          if (data.variants.length === 0) {
            newErrors.variants = 'Adicione pelo menos uma variante';
          }
          data.variants.forEach((variant, index) => {
            if (!variant.name) {
              newErrors[`variant_${index}_name`] = 'Nome é obrigatório';
            }
            if (variant.price <= 0) {
              newErrors[`variant_${index}_price`] =
                'Preço deve ser maior que zero';
            }
          });
          break;

        case 'stock':
          // Stock entries are optional
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [data]
  );

  const canProceed = useCallback((): boolean => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  // Reset
  const reset = useCallback(() => {
    setData(INITIAL_DATA);
    setCurrentStep('template');
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // Generate variants from attributes (e.g., colors x sizes)
  const generateVariantsFromAttributes = useCallback(
    (
      attributes: Array<{ name: string; values: string[] }>,
      basePrice: number
    ) => {
      if (attributes.length === 0) return;

      const combinations: Record<string, string>[] = [];

      const generateCombinations = (
        current: Record<string, string>,
        attrIndex: number
      ) => {
        if (attrIndex >= attributes.length) {
          combinations.push({ ...current });
          return;
        }

        const attr = attributes[attrIndex];
        for (const value of attr.values) {
          current[attr.name] = value;
          generateCombinations(current, attrIndex + 1);
        }
      };

      generateCombinations({}, 0);

      const variants: WizardVariant[] = combinations.map((combo, index) => ({
        id: `temp_${Date.now()}_${index}`,
        name: Object.values(combo).join(' / '),
        price: basePrice,
        attributes: combo,
      }));

      setVariants(variants);
    },
    [setVariants]
  );

  // Get completed steps for stepper display
  const getCompletedSteps = useCallback((): WizardStep[] => {
    const completed: WizardStep[] = [];
    if (data.template) completed.push('template');
    if (data.product?.name) completed.push('product');
    if (data.variants.length > 0) completed.push('variants');
    // stock is optional, mark as complete if we're past it or have entries
    if (
      currentStepIndex > STEPS.indexOf('stock') ||
      data.stockEntries.length > 0
    ) {
      completed.push('stock');
    }
    return completed;
  }, [data, currentStepIndex]);

  // Validate current step and return errors
  const validate = useCallback((): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 'template':
        if (!data.template) {
          newErrors.template = 'Selecione um template';
        }
        break;

      case 'product':
        if (!data.product?.name) {
          newErrors.name = 'Nome do produto é obrigatório';
        }
        break;

      case 'variants':
        if (data.variants.length === 0) {
          newErrors.variants = 'Adicione pelo menos uma variante';
        }
        data.variants.forEach((variant, index) => {
          if (!variant.name) {
            newErrors[`variant_${index}_name`] = 'Nome é obrigatório';
          }
          if (variant.price <= 0) {
            newErrors[`variant_${index}_price`] =
              'Preço deve ser maior que zero';
          }
        });
        break;

      case 'stock':
        // Stock entries are optional
        break;
    }

    return newErrors;
  }, [currentStep, data]);

  // Navigation helpers with cleaner names
  const canGoBack = !isFirstStep;
  const canGoForward = !isLastStep && validateStep(currentStep);
  const goBack = prevStep;
  const goForward = nextStep;

  // Alias for setProduct with better name
  const setProductData = setProduct;

  return {
    // State
    currentStep,
    data,
    errors,
    isSubmitting,

    // Computed
    currentStepIndex,
    isFirstStep,
    isLastStep,
    canGoBack,
    canGoForward,
    steps: STEPS,

    // Navigation
    goToStep,
    nextStep,
    prevStep,
    goBack,
    goForward,

    // Data setters
    setTemplate,
    setProduct,
    setProductData,
    setVariants,
    addVariant,
    updateVariant,
    removeVariant,
    setStockEntries,
    updateStockEntry,

    // Utilities
    validateStep,
    validate,
    canProceed,
    reset,
    generateVariantsFromAttributes,
    getCompletedSteps,
    setIsSubmitting,
  };
}
