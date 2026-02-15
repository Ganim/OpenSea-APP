'use client';

// ============================================
// STEP VALIDATE COMPONENT
// Passo 5: Validação final dos dados
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Package,
  Layers,
  Building2,
  RefreshCw,
  Info,
  ExternalLink,
} from 'lucide-react';
import { brasilApiService } from '@/services/brasilapi.service';
import { useManufacturers, useSuppliers } from '@/hooks/stock/use-stock-other';
import type { Template, Manufacturer, Supplier } from '@/types/stock';
import type {
  GroupedProduct,
  ValidationResult,
  ManufacturerToCreate,
} from '../hooks/use-catalog-import';

// ============================================
// TYPES
// ============================================

interface StepValidateProps {
  template: Template;
  groupedProducts: GroupedProduct[];
  validationResult: ValidationResult | null;
  onValidationResultChange: (result: ValidationResult | null) => void;
}

// ============================================
// COMPONENT
// ============================================

export function StepValidate({
  template,
  groupedProducts,
  validationResult,
  onValidationResultChange,
}: StepValidateProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const { data: existingManufacturers } = useManufacturers();
  const { data: existingSuppliers } = useSuppliers();

  // ============================================
  // VALIDATION LOGIC
  // ============================================

  const runValidation = useCallback(async () => {
    setIsValidating(true);
    setValidationProgress(0);
    setCurrentStep('Iniciando validação...');

    const result: ValidationResult = {
      valid: true,
      totalProducts: groupedProducts.length,
      totalVariants: groupedProducts.reduce(
        (sum, p) => sum + p.variants.length,
        0
      ),
      validProducts: 0,
      invalidProducts: 0,
      errors: [],
      warnings: [],
      manufacturersToCreate: [],
      manufacturersExisting: [],
    };

    try {
      // Step 1: Validate required fields (20%)
      setCurrentStep('Validando campos obrigatórios...');
      setValidationProgress(10);

      for (const product of groupedProducts) {
        if (!product.productData.name) {
          result.errors.push({
            type: 'product',
            field: 'name',
            message: 'Nome do produto é obrigatório',
          });
          result.valid = false;
        }

        for (const variant of product.variants) {
          if (!variant.data.name) {
            result.errors.push({
              type: 'variant',
              field: 'name',
              message: `Variante na linha ${variant.rowIndex + 1} sem nome`,
              rowIndex: variant.rowIndex,
            });
            result.valid = false;
          }
        }
      }

      setValidationProgress(20);

      // Step 2: Validate manufacturers by CNPJ (50%)
      setCurrentStep('Verificando fabricantes...');

      const manufacturerCnpjs = new Set<string>();
      for (const product of groupedProducts) {
        const cnpj = product.productData.manufacturerCnpj as string | undefined;
        if (cnpj) {
          manufacturerCnpjs.add(cnpj);
        }
      }

      if (manufacturerCnpjs.size > 0) {
        const existingCnpjs = new Map<string, Manufacturer>();
        if (existingManufacturers) {
          // Note: This assumes manufacturers have CNPJ field
          // If not, we'll create all as new
        }

        let processed = 0;
        for (const cnpj of manufacturerCnpjs) {
          // Check if exists in our database (would need CNPJ field)
          // For now, try to fetch from BrasilAPI
          try {
            const companyData = await brasilApiService.getCompanyByCnpj(cnpj);
            result.manufacturersToCreate.push({
              cnpj,
              name: companyData.razao_social,
              apiData: companyData as unknown as Record<string, unknown>,
            });
          } catch (error) {
            result.manufacturersToCreate.push({
              cnpj,
              error:
                error instanceof Error ? error.message : 'Erro ao buscar CNPJ',
            });
            result.warnings.push({
              type: 'product',
              field: 'manufacturerCnpj',
              message: `CNPJ ${cnpj} não encontrado na BrasilAPI`,
            });
          }

          processed++;
          setValidationProgress(
            20 + Math.round((processed / manufacturerCnpjs.size) * 30)
          );
        }
      }

      setValidationProgress(50);

      // Step 3: Validate template attributes (70%)
      setCurrentStep('Validando atributos do template...');

      const requiredProductAttrs = template.productAttributes
        ? Object.entries(template.productAttributes)
            .filter(([, attr]) => attr.required)
            .map(([key]) => key)
        : [];

      const requiredVariantAttrs = template.variantAttributes
        ? Object.entries(template.variantAttributes)
            .filter(([, attr]) => attr.required)
            .map(([key]) => key)
        : [];

      for (const product of groupedProducts) {
        const productAttrs = product.productData.attributes as
          | Record<string, unknown>
          | undefined;

        for (const attrKey of requiredProductAttrs) {
          if (!productAttrs || !productAttrs[attrKey]) {
            result.warnings.push({
              type: 'product',
              field: `attributes.${attrKey}`,
              message: `Atributo obrigatório "${attrKey}" não preenchido no produto "${product.productData.name}"`,
            });
          }
        }

        for (const variant of product.variants) {
          const variantAttrs = variant.data.attributes as
            | Record<string, unknown>
            | undefined;

          for (const attrKey of requiredVariantAttrs) {
            if (!variantAttrs || !variantAttrs[attrKey]) {
              result.warnings.push({
                type: 'variant',
                field: `attributes.${attrKey}`,
                message: `Atributo obrigatório "${attrKey}" não preenchido na variante da linha ${variant.rowIndex + 1}`,
                rowIndex: variant.rowIndex,
              });
            }
          }
        }
      }

      setValidationProgress(70);

      // Step 4: Validate data types (90%)
      setCurrentStep('Validando tipos de dados...');

      for (const product of groupedProducts) {
        for (const variant of product.variants) {
          // Validate price
          if (variant.data.price !== undefined && variant.data.price !== null) {
            if (
              typeof variant.data.price !== 'number' ||
              variant.data.price < 0
            ) {
              result.warnings.push({
                type: 'variant',
                field: 'price',
                message: `Preço inválido na linha ${variant.rowIndex + 1}`,
                rowIndex: variant.rowIndex,
              });
            }
          }

          // Validate colorHex
          if (variant.data.colorHex) {
            const hexPattern = /^#[0-9A-Fa-f]{6}$/;
            if (!hexPattern.test(String(variant.data.colorHex))) {
              result.warnings.push({
                type: 'variant',
                field: 'colorHex',
                message: `Cor hexadecimal inválida na linha ${variant.rowIndex + 1}: ${variant.data.colorHex}`,
                rowIndex: variant.rowIndex,
              });
            }
          }
        }
      }

      setValidationProgress(90);

      // Step 5: Calculate final counts
      setCurrentStep('Finalizando validação...');

      result.validProducts =
        result.errors.filter(e => e.type === 'product').length === 0
          ? groupedProducts.length
          : groupedProducts.length -
            new Set(
              result.errors
                .filter(e => e.type === 'product')
                .map(e => e.rowIndex)
            ).size;
      result.invalidProducts = groupedProducts.length - result.validProducts;

      // If only warnings, still valid
      if (result.errors.length === 0) {
        result.valid = true;
        result.validProducts = groupedProducts.length;
        result.invalidProducts = 0;
      }

      setValidationProgress(100);
      onValidationResultChange(result);
    } catch (error) {
      result.valid = false;
      result.errors.push({
        type: 'product',
        field: 'system',
        message:
          error instanceof Error ? error.message : 'Erro durante validação',
      });
      onValidationResultChange(result);
    } finally {
      setIsValidating(false);
    }
  }, [
    groupedProducts,
    template,
    existingManufacturers,
    onValidationResultChange,
  ]);

  // Auto-run validation on mount
  useEffect(() => {
    if (!validationResult) {
      runValidation();
    }
  }, []);

  // ============================================
  // RENDER
  // ============================================

  if (isValidating) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="w-full space-y-2">
              <Progress value={validationProgress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {currentStep}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validationResult) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Validação não iniciada</p>
          <Button onClick={runValidation}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Iniciar Validação
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Result summary */}
      <Card
        className={cn(
          'border-2',
          validationResult.valid
            ? 'border-green-200 dark:border-green-900'
            : 'border-red-200 dark:border-red-900'
        )}
      >
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            {validationResult.valid ? (
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {validationResult.valid
                  ? 'Validação concluída com sucesso!'
                  : 'Validação encontrou problemas'}
              </h3>
              <p className="text-muted-foreground">
                {validationResult.valid
                  ? 'Os dados estão prontos para importação.'
                  : 'Corrija os erros antes de prosseguir.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={runValidation}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Revalidar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {validationResult.totalProducts}
                </p>
                <p className="text-sm text-muted-foreground">Produtos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Layers className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {validationResult.totalVariants}
                </p>
                <p className="text-sm text-muted-foreground">Variantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {validationResult.validProducts}
                </p>
                <p className="text-sm text-muted-foreground">Válidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {validationResult.manufacturersToCreate.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Novos fabricantes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manufacturers to create */}
      {validationResult.manufacturersToCreate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              Fabricantes a serem criados
            </CardTitle>
            <CardDescription>
              Estes fabricantes serão criados automaticamente durante a
              importação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationResult.manufacturersToCreate.map((mfr, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    mfr.error
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200'
                      : 'bg-muted/30'
                  )}
                >
                  <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {mfr.name || 'Nome não encontrado'}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      CNPJ:{' '}
                      {mfr.cnpj.replace(
                        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                        '$1.$2.$3/$4-$5'
                      )}
                    </p>
                  </div>
                  {mfr.error ? (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {mfr.error}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Encontrado
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {validationResult.errors.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Erros ({validationResult.errors.length})
            </CardTitle>
            <CardDescription>
              Estes erros precisam ser corrigidos antes de importar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <ul className="space-y-2">
                {validationResult.errors.map((error, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <Badge variant="outline" className="mr-2">
                        {error.type === 'product' ? 'Produto' : 'Variante'}
                      </Badge>
                      {error.message}
                      {error.rowIndex !== undefined && (
                        <span className="text-muted-foreground">
                          {' '}
                          (linha {error.rowIndex + 1})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Avisos ({validationResult.warnings.length})
            </CardTitle>
            <CardDescription>
              Avisos não impedem a importação, mas podem indicar problemas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <ul className="space-y-2">
                {validationResult.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <Badge variant="outline" className="mr-2">
                        {warning.type === 'product' ? 'Produto' : 'Variante'}
                      </Badge>
                      {warning.message}
                      {warning.rowIndex !== undefined && (
                        <span className="text-muted-foreground">
                          {' '}
                          (linha {warning.rowIndex + 1})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Ready to import */}
      {validationResult.valid && (
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-green-500" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Clique em "Próximo" para iniciar a importação de{' '}
                <strong>{validationResult.totalProducts} produtos</strong> e{' '}
                <strong>{validationResult.totalVariants} variantes</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
