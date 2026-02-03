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
import {
  useCategories,
  useManufacturers,
  useSuppliers,
} from '../../_shared/hooks/use-reference-data';
import type {
  FieldOption,
  ImportConfig,
  ValidationResult,
} from '../../_shared/types';

// Storage keys
const STORAGE_KEY = 'opensea-import-configs';
const ACTIVE_CONFIG_KEY = 'opensea-import-active-config';

// Helper to get active config from localStorage
function getActiveConfig(): ImportConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    // First try session storage (from config page)
    const sessionConfig = sessionStorage.getItem('import-products-config');
    if (sessionConfig) {
      const parsed = JSON.parse(sessionConfig);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      };
    }

    // Fall back to active config in localStorage
    const activeStored = localStorage.getItem(ACTIVE_CONFIG_KEY);
    if (!activeStored) return null;

    const activeConfigs: Record<string, string> = JSON.parse(activeStored);
    const activeId = activeConfigs['products'];
    if (!activeId) return null;

    const storedConfigs = localStorage.getItem(STORAGE_KEY);
    if (!storedConfigs) return null;

    const configs = JSON.parse(storedConfigs);
    const found = configs.find((c: { id: string }) => c.id === activeId);

    if (found && found.templateId) {
      return {
        entityType: found.entityType,
        templateId: found.templateId,
        templateName: found.templateName,
        fields: found.fields,
        name: found.name,
        createdAt: new Date(found.createdAt),
        updatedAt: new Date(found.updatedAt),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export default function ProductsSheetsPage() {
  const router = useRouter();
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [config, setConfig] = useState<ImportConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const entityDef = ENTITY_DEFINITIONS.products;

  // Fetch reference data
  const { data: suppliers } = useSuppliers();
  const { data: manufacturers } = useManufacturers();
  const { data: categories } = useCategories();

  // Load config on mount
  useEffect(() => {
    const loadedConfig = getActiveConfig();
    setConfig(loadedConfig);
    setIsLoading(false);
  }, []);

  // Get enabled fields sorted by order
  const enabledFields = useMemo(() => {
    if (!config) return [];
    return config.fields
      .filter(f => f.enabled)
      .sort((a, b) => a.order - b.order);
  }, [config]);

  // Count custom attribute fields
  const customAttributeCount = useMemo(() => {
    return enabledFields.filter(f => f.key.startsWith('attributes.')).length;
  }, [enabledFields]);

  // Build reference data for dropdowns
  const referenceDataMap = useMemo(() => {
    const map: Record<string, FieldOption[]> = {};

    enabledFields.forEach(field => {
      if (field.type === 'reference' && field.referenceEntity) {
        switch (field.referenceEntity) {
          case 'suppliers':
            map[field.key] = suppliers || [];
            break;
          case 'manufacturers':
            map[field.key] = manufacturers || [];
            break;
          case 'categories':
            map[field.key] = categories || [];
            break;
        }
      } else if (field.type === 'select' && field.options) {
        map[field.key] = field.options;
      }
    });

    return map;
  }, [enabledFields, suppliers, manufacturers, categories]);

  // Spreadsheet hook
  const spreadsheet = useImportSpreadsheet(enabledFields);

  // Import process hook - inject templateId into all rows
  const importProcess = useImportProcess({
    entityType: 'products',
    batchSize: 10,
    delayBetweenBatches: 1000,
    // Inject templateId into every row before sending
    transformRow: config?.templateId
      ? row => ({
          ...row,
          data: { ...row.data, templateId: config.templateId },
        })
      : undefined,
    onComplete: result => {
      toast.success(
        `Importacao concluida! ${result.importedRows} produtos importados.`
      );
    },
    onError: error => {
      toast.error(`Erro na importacao: ${error.message}`);
    },
  });

  // Load CSV data if available
  useEffect(() => {
    const stored = sessionStorage.getItem('import-products-data');
    if (stored) {
      try {
        const { data } = JSON.parse(stored);
        spreadsheet.applyPastedData(data);
        sessionStorage.removeItem('import-products-data');
      } catch (e) {
        console.error('Failed to load CSV data:', e);
      }
    }
  }, []);

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
      // Clear spreadsheet and redirect
      spreadsheet.clearAll();
      // Clear session storage config
      sessionStorage.removeItem('import-products-config');
      router.push('/import/products');
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

  // No config or no template selected
  if (!config || !config.templateId || enabledFields.length === 0) {
    return (
      <PageLayout backgroundVariant="none" maxWidth="full">
        <Header
          title="Importar Produtos"
          description="Preencha a planilha com os dados dos produtos"
          buttons={[
            {
              id: 'back',
              title: 'Voltar',
              icon: ArrowLeft,
              variant: 'outline',
              onClick: () => router.push('/import/products'),
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
              Selecione um template e configure os campos de importacao
            </p>
            <Button onClick={() => router.push('/import/products/config')}>
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
        title="Importar Produtos"
        description="Preencha a planilha ou cole dados do Excel (Ctrl+V)"
        buttons={[
          {
            id: 'back',
            title: 'Voltar',
            icon: ArrowLeft,
            variant: 'outline',
            onClick: () => router.push('/import/products'),
          },
          {
            id: 'config',
            title: 'Configurar',
            icon: Settings,
            variant: 'outline',
            onClick: () => router.push('/import/products/config'),
          },
        ]}
      />

      {/* Template info banner */}
      <Card className="mb-4 border-blue-500/30 bg-blue-500/5">
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-500" />
            <div>
              <span className="font-medium">Template: </span>
              <span className="text-muted-foreground">
                {config.templateName}
              </span>
            </div>
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
            onClick={() => router.push('/import/products/config')}
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
        entityName="Produtos"
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
        entityLabel={entityDef.labelPlural}
      />
    </PageLayout>
  );
}
