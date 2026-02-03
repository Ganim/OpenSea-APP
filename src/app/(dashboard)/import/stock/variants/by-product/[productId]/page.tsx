'use client';

import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Package,
  Play,
  Sparkles,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

import { ImportProgressDialog } from '../../../../_shared/components/import-progress-dialog';
import { ImportSpreadsheet } from '../../../../_shared/components/import-spreadsheet';
import {
  ENTITY_DEFINITIONS,
  getEntityFields,
} from '../../../../_shared/config/entity-definitions';
import { useImportProcess } from '../../../../_shared/hooks/use-import-process';
import { useImportSpreadsheet } from '../../../../_shared/hooks/use-import-spreadsheet';
import type {
  FieldOption,
  ImportFieldConfig,
  ValidationResult,
} from '../../../../_shared/types';

// Fetch product details
async function fetchProduct(productId: string) {
  return apiClient
    .get<{
      product: { id: string; name: string; code?: string; templateId?: string };
    }>(`/v1/products/${productId}`)
    .then(res => res.product);
}

// Fetch template details
async function fetchTemplate(templateId: string) {
  return apiClient
    .get<{
      template: {
        id: string;
        name: string;
        variantAttributes?: Record<string, unknown>;
      };
    }>(`/v1/templates/${templateId}`)
    .then(res => res.template);
}

export default function ImportVariantsByProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const entityDef = ENTITY_DEFINITIONS.variants;

  // Fetch product data
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId,
  });

  // Fetch template data if product has templateId
  const { data: template, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['template', product?.templateId],
    queryFn: () => fetchTemplate(product!.templateId!),
    enabled: !!product?.templateId,
  });

  // Build fields for variant import (excluding productId since it's fixed)
  const enabledFields = useMemo(() => {
    const baseFields = getEntityFields('variants');

    // Filter out productId (it will be injected automatically)
    const filteredFields = baseFields.filter(f => f.key !== 'productId');

    // Map to ImportFieldConfig format
    const fields: ImportFieldConfig[] = filteredFields.map((field, index) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
      enabled: true,
      order: index,
      options: field.options,
      referenceEntity: field.referenceEntity as 'locations' | undefined,
      referenceDisplayField: field.referenceDisplayField,
      minLength: field.validation?.minLength,
      maxLength: field.validation?.maxLength,
      min: field.validation?.min,
      max: field.validation?.max,
      pattern: field.validation?.pattern,
      patternMessage: field.validation?.patternMessage,
      defaultValue: field.defaultValue,
    }));

    // Add template variant attributes if available
    if (template?.variantAttributes) {
      let order = fields.length;
      Object.entries(template.variantAttributes).forEach(
        ([key, attrConfig]: [string, any]) => {
          fields.push({
            key: `attributes.${key}`,
            label: attrConfig.label || key,
            customLabel: attrConfig.label,
            type: attrConfig.type === 'select' ? 'select' : 'text',
            required: attrConfig.required || false,
            enabled: true,
            order: order++,
            options: attrConfig.options?.map((opt: string) => ({
              value: opt,
              label: opt,
            })),
          });
        }
      );
    }

    return fields;
  }, [template]);

  // Count custom attribute fields
  const customAttributeCount = useMemo(() => {
    return enabledFields.filter(f => f.key.startsWith('attributes.')).length;
  }, [enabledFields]);

  // Build reference data map
  const referenceDataMap = useMemo(() => {
    const map: Record<string, FieldOption[]> = {};

    enabledFields.forEach(field => {
      if (field.type === 'select' && field.options) {
        map[field.key] = field.options;
      }
    });

    return map;
  }, [enabledFields]);

  // Spreadsheet hook
  const spreadsheet = useImportSpreadsheet(enabledFields);

  // Import process hook - inject productId into all rows
  const importProcess = useImportProcess({
    entityType: 'variants',
    batchSize: 10,
    delayBetweenBatches: 1000,
    transformRow: row => ({
      ...row,
      data: { ...row.data, productId },
    }),
    onComplete: result => {
      toast.success(
        `Importacao concluida! ${result.importedRows} variantes importadas.`
      );
    },
    onError: error => {
      toast.error(`Erro na importacao: ${error.message}`);
    },
  });

  // Update headers when config changes
  useEffect(() => {
    if (enabledFields.length > 0) {
      spreadsheet.updateHeaders(enabledFields);
    }
  }, [enabledFields]);

  const handleValidate = () => {
    const result = spreadsheet.validate();
    setValidationResult(result);

    if (result.valid) {
      toast.success(`${result.totalRows} linhas validadas com sucesso!`);
    } else {
      toast.error(
        `${result.errors.length} erros encontrados. Corrija antes de importar.`
      );
    }
  };

  const handleImport = async () => {
    const result = spreadsheet.validate();
    setValidationResult(result);

    if (!result.valid) {
      toast.error('Corrija os erros antes de importar.');
      return;
    }

    if (result.totalRows === 0) {
      toast.error('Nenhum dado para importar.');
      return;
    }

    const rowData = spreadsheet.getRowData();
    setShowProgressDialog(true);

    try {
      await importProcess.startImport(rowData);
    } catch {
      // Error handled by onError callback
    }
  };

  const handleProgressClose = () => {
    setShowProgressDialog(false);
    importProcess.reset();

    if (importProcess.isCompleted) {
      spreadsheet.clearAll();
      router.push(`/stock/products/${productId}`);
    }
  };

  if (isLoadingProduct || isLoadingTemplate) {
    return (
      <PageLayout backgroundVariant="none" maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout backgroundVariant="none" maxWidth="full">
        <Header
          title="Produto nao encontrado"
          description="O produto solicitado nao foi encontrado"
          buttons={[
            {
              id: 'back',
              title: 'Voltar',
              icon: ArrowLeft,
              variant: 'outline',
              onClick: () => router.push('/stock/products'),
            },
          ]}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout backgroundVariant="none" maxWidth="full">
      <Header
        title={`Importar Variantes`}
        description={`Adicione variantes para: ${product.name}`}
        buttons={[
          {
            id: 'back',
            title: 'Voltar',
            icon: ArrowLeft,
            variant: 'outline',
            onClick: () => router.push(`/stock/products/${productId}`),
          },
        ]}
      />

      {/* Product info banner */}
      <Card className="mb-4 border-purple-500/30 bg-purple-500/5">
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-purple-500" />
            <div>
              <span className="font-medium">Produto: </span>
              <span className="text-muted-foreground">{product.name}</span>
              {product.code && (
                <Badge variant="outline" className="ml-2">
                  {product.code}
                </Badge>
              )}
            </div>
            {template && (
              <>
                <span className="text-muted-foreground">|</span>
                <div>
                  <span className="font-medium">Template: </span>
                  <span className="text-muted-foreground">{template.name}</span>
                </div>
              </>
            )}
            {customAttributeCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                {customAttributeCount} atributos personalizados
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action bar */}
      <Card className="mb-4">
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Layers className="w-3 h-3" />
              {spreadsheet.filledRowCount}{' '}
              {spreadsheet.filledRowCount === 1 ? 'variante' : 'variantes'} para
              importar
            </Badge>
            {validationResult &&
              (validationResult.valid ? (
                <Badge variant="default" className="gap-1 bg-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  Dados validos
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {validationResult.errors.length} erros
                </Badge>
              ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleValidate}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Validar
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                spreadsheet.filledRowCount === 0 || importProcess.isProcessing
              }
            >
              <Play className="w-4 h-4 mr-2" />
              Importar{' '}
              {spreadsheet.filledRowCount > 0 &&
                `(${spreadsheet.filledRowCount})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spreadsheet */}
      <ImportSpreadsheet
        data={spreadsheet.data}
        headers={enabledFields}
        onDataChange={spreadsheet.setData}
        onAddRow={spreadsheet.addRow}
        onClearAll={spreadsheet.clearAll}
        validationResult={validationResult}
        referenceData={referenceDataMap}
        entityName="Variantes"
        showFileUpload={true}
        showDownloadTemplate={true}
      />

      {/* Progress Dialog */}
      <ImportProgressDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
        progress={importProcess.progress}
        onPause={importProcess.pauseImport}
        onResume={importProcess.resumeImport}
        onCancel={importProcess.cancelImport}
        onClose={handleProgressClose}
        entityLabel="Variantes"
      />
    </PageLayout>
  );
}
