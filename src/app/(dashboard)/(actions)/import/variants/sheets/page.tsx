'use client';

import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Package,
  Play,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ImportProgressDialog } from '../../_shared/components/import-progress-dialog';
import { ImportSpreadsheet } from '../../_shared/components/import-spreadsheet';
import { ENTITY_DEFINITIONS } from '../../_shared/config/entity-definitions';
import { useImportProcess } from '../../_shared/hooks/use-import-process';
import { useImportSpreadsheet } from '../../_shared/hooks/use-import-spreadsheet';
import type {
  FieldOption,
  ImportConfig,
  ImportFieldConfig,
  ValidationResult,
} from '../../_shared/types';

// Extended config for variants (includes productId)
interface VariantImportConfig extends ImportConfig {
  productId?: string;
  productName?: string;
}

// Helper to get config from sessionStorage
function getActiveConfig(): VariantImportConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem('import-variants-config');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
    };
  } catch {
    return null;
  }
}

export default function VariantsSheetsPage() {
  const router = useRouter();
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [config, setConfig] = useState<VariantImportConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const entityDef = ENTITY_DEFINITIONS.variants;

  // Load config on mount
  useEffect(() => {
    const loadedConfig = getActiveConfig();
    setConfig(loadedConfig);
    setIsLoading(false);
  }, []);

  // Get enabled fields from config
  const enabledFields = useMemo(() => {
    if (!config) return [];
    return config.fields
      .filter(f => f.enabled)
      .sort((a, b) => a.order - b.order);
  }, [config]);

  // Count custom attributes
  const customAttributeCount = useMemo(() => {
    return enabledFields.filter(f => f.key.startsWith('attributes.')).length;
  }, [enabledFields]);

  // Build reference data for dropdowns (variants don't have many FK fields to show)
  const referenceDataMap = useMemo(() => {
    const map: Record<string, FieldOption[]> = {};

    enabledFields.forEach(field => {
      // For select fields with options
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
    // Inject productId into every row before sending
    transformRow: config?.productId
      ? row => ({
          ...row,
          data: { ...row.data, productId: config.productId },
        })
      : undefined,
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
    // Validate first
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
      sessionStorage.removeItem('import-variants-config');
      router.push('/import/variants');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageLayout backgroundVariant="none" maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  // No config or no product selected
  if (!config || !config.productId || enabledFields.length === 0) {
    return (
      <PageLayout backgroundVariant="none" maxWidth="full">
        <Header
          title="Importar Variantes"
          description="Preencha a planilha com os dados das variantes"
          buttons={[
            {
              id: 'back',
              title: 'Voltar',
              icon: ArrowLeft,
              variant: 'outline',
              onClick: () => router.push('/import/variants'),
            },
          ]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Configuracao Necessaria
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Selecione um produto e configure os campos de importacao
            </p>
            <Button onClick={() => router.push('/import/variants/config')}>
              <Settings className="w-4 h-4 mr-2" />
              Configurar Importacao
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout backgroundVariant="none" maxWidth="full">
      <Header
        title="Importar Variantes"
        description="Preencha a planilha ou cole dados do Excel (Ctrl+V)"
        buttons={[
          {
            id: 'back',
            title: 'Voltar',
            icon: ArrowLeft,
            variant: 'outline',
            onClick: () => router.push('/import/variants'),
          },
          {
            id: 'config',
            title: 'Configurar',
            icon: Settings,
            variant: 'outline',
            onClick: () => router.push('/import/variants/config'),
          },
        ]}
      />

      {/* Product info banner */}
      <Card className="mb-4 border-purple-500/30 bg-purple-500/5">
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-purple-500" />
            <div>
              <span className="font-medium">Produto: </span>
              <span className="text-muted-foreground">
                {config.productName}
              </span>
            </div>
            {config.templateName && (
              <Badge variant="secondary" className="gap-1">
                <Package className="w-3 h-3" />
                {config.templateName}
              </Badge>
            )}
            {customAttributeCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                {customAttributeCount} atributos personalizados
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/import/variants/config')}
          >
            Alterar
          </Button>
        </CardContent>
      </Card>

      {/* Action bar */}
      <Card className="mb-4">
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              {spreadsheet.filledRowCount}{' '}
              {spreadsheet.filledRowCount === 1 ? 'linha' : 'linhas'}{' '}
              preenchidas
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
