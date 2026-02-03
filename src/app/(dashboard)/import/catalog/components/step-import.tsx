'use client';

// ============================================
// STEP IMPORT COMPONENT
// Passo 6: Execução da importação
// ============================================

import { useCallback, useRef, useState } from 'react';
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
  Loader2,
  Package,
  Layers,
  Play,
  Pause,
  X,
  RefreshCw,
  Download,
  PartyPopper,
} from 'lucide-react';
import { useCreateProduct } from '@/hooks/stock/use-products';
import { useCreateVariant } from '@/hooks/stock/use-variants';
import { useCreateManufacturer } from '@/hooks/stock/use-stock-other';
import { useCodeGenerator } from '../../_shared/hooks/use-code-generator';
import type { Template } from '@/types/stock';
import type {
  GroupedProduct,
  ImportProgress,
  ValidationResult,
  ManufacturerToCreate,
} from '../hooks/use-catalog-import';

// ============================================
// TYPES
// ============================================

interface StepImportProps {
  template: Template;
  groupedProducts: GroupedProduct[];
  validationResult: ValidationResult;
  importProgress: ImportProgress;
  onImportProgressChange: (progress: ImportProgress) => void;
}

// ============================================
// CONSTANTS
// ============================================

const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 500; // ms

// ============================================
// COMPONENT
// ============================================

export function StepImport({
  template,
  groupedProducts,
  validationResult,
  importProgress,
  onImportProgressChange,
}: StepImportProps) {
  const [isPaused, setIsPaused] = useState(false);
  const pauseRef = useRef(false);
  const cancelRef = useRef(false);

  const createProductMutation = useCreateProduct();
  const createVariantMutation = useCreateVariant();
  const createManufacturerMutation = useCreateManufacturer();
  const { generateProductCode, generateVariantCode } = useCodeGenerator();

  // ============================================
  // IMPORT LOGIC
  // ============================================

  const startImport = useCallback(async () => {
    cancelRef.current = false;
    pauseRef.current = false;
    setIsPaused(false);

    const totalProducts = groupedProducts.length;
    const totalVariants = groupedProducts.reduce(
      (sum, p) => sum + p.variants.length,
      0
    );

    onImportProgressChange({
      status: 'importing',
      totalProducts,
      totalVariants,
      importedProducts: 0,
      importedVariants: 0,
      failedProducts: 0,
      failedVariants: 0,
      errors: [],
      startedAt: new Date(),
    });

    // Store created manufacturer IDs
    const manufacturerIdMap = new Map<string, string>();

    // Step 1: Create manufacturers first
    if (validationResult.manufacturersToCreate.length > 0) {
      for (const mfr of validationResult.manufacturersToCreate) {
        if (cancelRef.current) break;
        if (mfr.error) continue; // Skip invalid CNPJs

        try {
          const result = await createManufacturerMutation.mutateAsync({
            name: mfr.name || `Fabricante ${mfr.cnpj}`,
            country: 'Brasil',
            // Add more fields from apiData if available
          });
          if (result?.manufacturer?.id) {
            manufacturerIdMap.set(mfr.cnpj, result.manufacturer.id);
          }
        } catch (error) {
          console.error('Error creating manufacturer:', error);
        }
      }
    }

    // Step 2: Import products and variants
    let importedProducts = 0;
    let importedVariants = 0;
    let failedProducts = 0;
    let failedVariants = 0;
    const errors: Array<{
      productName: string;
      message: string;
      rowIndex?: number;
    }> = [];
    let productSequential = 1;

    for (let i = 0; i < groupedProducts.length; i++) {
      // Check for cancel
      if (cancelRef.current) {
        onImportProgressChange({
          status: 'cancelled',
          totalProducts,
          totalVariants,
          importedProducts,
          importedVariants,
          failedProducts,
          failedVariants,
          errors,
          startedAt: importProgress.startedAt,
          completedAt: new Date(),
        });
        return;
      }

      // Check for pause
      while (pauseRef.current && !cancelRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const product = groupedProducts[i];
      const productName = String(product.productData.name || 'Sem nome');

      onImportProgressChange({
        status: 'importing',
        totalProducts,
        totalVariants,
        importedProducts,
        importedVariants,
        failedProducts,
        failedVariants,
        currentProduct: productName,
        errors,
        startedAt: importProgress.startedAt,
      });

      try {
        // Generate product code
        const productCode = generateProductCode({
          templateCode:
            template.code || template.name.substring(0, 3).toUpperCase(),
          manufacturerCode: 'GEN', // Generic if no manufacturer
          sequentialCode: productSequential,
        });

        // Prepare product data
        const productPayload = {
          name: productName,
          code: productCode,
          description: product.productData.description as string | undefined,
          templateId: template.id,
          manufacturerId: product.productData.manufacturerCnpj
            ? manufacturerIdMap.get(
                String(product.productData.manufacturerCnpj)
              )
            : undefined,
          attributes: product.productData.attributes as
            | Record<string, unknown>
            | undefined,
        };

        // Create product
        const createdProduct =
          await createProductMutation.mutateAsync(productPayload);

        if (createdProduct?.product?.id) {
          importedProducts++;
          productSequential++;

          // Create variants for this product
          let variantSequential = 1;
          for (const variant of product.variants) {
            // Check for cancel during variant creation
            if (cancelRef.current) break;

            try {
              // Generate variant code
              const variantCode = generateVariantCode({
                templateCode:
                  template.code || template.name.substring(0, 3).toUpperCase(),
                manufacturerCode: 'GEN',
                productSequentialCode: productSequential - 1,
                colorRef: String(
                  variant.data.reference || `V${variantSequential}`
                ),
                variantSequentialCode: variantSequential,
              });

              const variantPayload = {
                productId: createdProduct.product.id,
                name: String(
                  variant.data.name || `Variante ${variantSequential}`
                ),
                sku: variantCode,
                price: variant.data.price as number | undefined,
                costPrice: variant.data.costPrice as number | undefined,
                barcode: variant.data.barcode as string | undefined,
                colorHex: variant.data.colorHex as string | undefined,
                colorPantone: variant.data.colorPantone as string | undefined,
                reference: variant.data.reference as string | undefined,
                minStock: variant.data.minStock as number | undefined,
                maxStock: variant.data.maxStock as number | undefined,
                attributes: variant.data.attributes as
                  | Record<string, unknown>
                  | undefined,
              };

              await createVariantMutation.mutateAsync(variantPayload);
              importedVariants++;
              variantSequential++;
            } catch (error) {
              failedVariants++;
              errors.push({
                productName,
                message: `Erro ao criar variante: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                rowIndex: variant.rowIndex,
              });
            }

            // Update progress after each variant
            onImportProgressChange({
              status: 'importing',
              totalProducts,
              totalVariants,
              importedProducts,
              importedVariants,
              failedProducts,
              failedVariants,
              currentProduct: productName,
              errors,
              startedAt: importProgress.startedAt,
            });
          }
        }
      } catch (error) {
        failedProducts++;
        errors.push({
          productName,
          message: `Erro ao criar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        });
      }

      // Delay between batches
      if ((i + 1) % BATCH_SIZE === 0) {
        await new Promise(resolve =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES)
        );
      }
    }

    // Final state
    onImportProgressChange({
      status:
        errors.length > 0 && importedProducts === 0 ? 'failed' : 'completed',
      totalProducts,
      totalVariants,
      importedProducts,
      importedVariants,
      failedProducts,
      failedVariants,
      errors,
      startedAt: importProgress.startedAt,
      completedAt: new Date(),
    });
  }, [
    groupedProducts,
    template,
    validationResult,
    importProgress.startedAt,
    onImportProgressChange,
    createProductMutation,
    createVariantMutation,
    createManufacturerMutation,
    generateProductCode,
    generateVariantCode,
  ]);

  const pauseImport = () => {
    pauseRef.current = true;
    setIsPaused(true);
    onImportProgressChange({
      ...importProgress,
      status: 'paused',
    });
  };

  const resumeImport = () => {
    pauseRef.current = false;
    setIsPaused(false);
    onImportProgressChange({
      ...importProgress,
      status: 'importing',
    });
  };

  const cancelImport = () => {
    cancelRef.current = true;
    pauseRef.current = false;
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const progressPercent =
    importProgress.totalProducts > 0
      ? Math.round(
          ((importProgress.importedProducts + importProgress.failedProducts) /
            importProgress.totalProducts) *
            100
        )
      : 0;

  const isRunning = importProgress.status === 'importing';
  const isPausedState = importProgress.status === 'paused';
  const isCompleted = importProgress.status === 'completed';
  const isFailed = importProgress.status === 'failed';
  const isCancelled = importProgress.status === 'cancelled';
  const isIdle = importProgress.status === 'idle';

  // ============================================
  // RENDER
  // ============================================

  // Idle state - waiting to start
  if (isIdle) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Package className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pronto para Importar</h3>
              <p className="text-muted-foreground mt-1">
                {validationResult.totalProducts} produtos e{' '}
                {validationResult.totalVariants} variantes serão importados.
              </p>
            </div>
            <Button size="lg" onClick={startImport}>
              <Play className="h-5 w-5 mr-2" />
              Iniciar Importação
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Running or paused state
  if (isRunning || isPausedState) {
    return (
      <div className="space-y-6">
        {/* Progress card */}
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPausedState ? (
                    <Pause className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  <span className="font-medium">
                    {isPausedState ? 'Importação Pausada' : 'Importando...'}
                  </span>
                </div>
                <span className="text-2xl font-bold">{progressPercent}%</span>
              </div>

              <Progress value={progressPercent} className="h-3" />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {importProgress.importedProducts} de{' '}
                  {importProgress.totalProducts} produtos
                </span>
                <span>
                  {importProgress.importedVariants} de{' '}
                  {importProgress.totalVariants} variantes
                </span>
              </div>

              {importProgress.currentProduct && (
                <p className="text-sm text-center text-muted-foreground">
                  Atual: {importProgress.currentProduct}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {isPausedState ? (
            <Button onClick={resumeImport}>
              <Play className="h-4 w-4 mr-2" />
              Continuar
            </Button>
          ) : (
            <Button variant="outline" onClick={pauseImport}>
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          )}
          <Button variant="destructive" onClick={cancelImport}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>

        {/* Errors during import */}
        {importProgress.errors.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">
                Erros durante importação ({importProgress.errors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                <ul className="space-y-1 text-sm">
                  {importProgress.errors.map((error, idx) => (
                    <li key={idx} className="text-red-600">
                      • {error.productName}: {error.message}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 dark:border-green-900">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <PartyPopper className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Importação Concluída!
                </h3>
                <p className="text-muted-foreground mt-2">
                  Seus dados foram importados com sucesso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {importProgress.importedProducts}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Produtos criados
                  </p>
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
                    {importProgress.importedVariants}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Variantes criadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {importProgress.failedProducts}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Produtos com erro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {importProgress.failedVariants}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Variantes com erro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Errors list */}
        {importProgress.errors.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-base text-red-600">
                Erros ({importProgress.errors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <ul className="space-y-2 text-sm">
                  {importProgress.errors.map((error, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>{error.productName}:</strong> {error.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" asChild>
            <a href="/stock/products">
              <Package className="h-4 w-4 mr-2" />
              Ver Produtos
            </a>
          </Button>
          <Button asChild>
            <a href="/import">
              <RefreshCw className="h-4 w-4 mr-2" />
              Nova Importação
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Failed state
  if (isFailed) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">
                Importação Falhou
              </h3>
              <p className="text-muted-foreground mt-1">
                Ocorreram erros durante a importação. Verifique os detalhes
                abaixo.
              </p>
            </div>
            <Button onClick={startImport}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Cancelled state
  if (isCancelled) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-muted p-4">
              <X className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Importação Cancelada</h3>
              <p className="text-muted-foreground mt-1">
                {importProgress.importedProducts} produtos e{' '}
                {importProgress.importedVariants} variantes foram importados
                antes do cancelamento.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <a href="/stock/products">Ver Produtos Importados</a>
              </Button>
              <Button onClick={startImport}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Continuar de onde parou
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
