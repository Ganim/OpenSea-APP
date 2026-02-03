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
  LayoutTemplate,
  Play,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ImportProgressDialog } from '../../_shared/components/import-progress-dialog';
import { ImportSpreadsheet } from '../../_shared/components/import-spreadsheet';
import {
  ENTITY_DEFINITIONS,
  getEntityFields,
} from '../../_shared/config/entity-definitions';
import { useImportProcess } from '../../_shared/hooks/use-import-process';
import { useImportSpreadsheet } from '../../_shared/hooks/use-import-spreadsheet';
import type {
  FieldOption,
  ImportFieldConfig,
  ValidationResult,
} from '../../_shared/types';

export default function TemplatesSheetsPage() {
  const router = useRouter();
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const entityDef = ENTITY_DEFINITIONS.templates;
  const baseFields = getEntityFields('templates');

  // Create field configs from entity definition
  const fieldConfigs: ImportFieldConfig[] = useMemo(() => {
    return baseFields.map((field, index) => ({
      key: field.key,
      label: field.label,
      customLabel: undefined,
      enabled: true,
      order: index,
      type: field.type,
      required: field.required,
      defaultValue: field.defaultValue,
      options: field.options,
      minLength: field.validation?.minLength,
      maxLength: field.validation?.maxLength,
      min: field.validation?.min,
      max: field.validation?.max,
      pattern: field.validation?.pattern,
      patternMessage: field.validation?.patternMessage,
    }));
  }, [baseFields]);

  // Build reference data for dropdowns (select fields)
  const referenceDataMap = useMemo(() => {
    const map: Record<string, FieldOption[]> = {};

    fieldConfigs.forEach(field => {
      if (field.type === 'select' && field.options) {
        map[field.key] = field.options;
      }
    });

    return map;
  }, [fieldConfigs]);

  // Spreadsheet hook
  const spreadsheet = useImportSpreadsheet(fieldConfigs);

  // Import process hook
  const importProcess = useImportProcess({
    entityType: 'templates',
    batchSize: 10,
    delayBetweenBatches: 500,
    onComplete: result => {
      toast.success(
        `Importacao concluida! ${result.importedRows} templates importados.`
      );
    },
    onError: error => {
      toast.error(`Erro na importacao: ${error.message}`);
    },
  });

  // Load CSV data if available
  useEffect(() => {
    const stored = sessionStorage.getItem('import-templates-data');
    if (stored) {
      try {
        const { data } = JSON.parse(stored);
        spreadsheet.applyPastedData(data);
        sessionStorage.removeItem('import-templates-data');
      } catch (e) {
        console.error('Failed to load CSV data:', e);
      }
    }
  }, []);

  // Update headers when fields change
  useEffect(() => {
    if (fieldConfigs.length > 0) {
      spreadsheet.updateHeaders(fieldConfigs);
    }
  }, [fieldConfigs]);

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
      router.push('/import/templates');
    }
  };

  // Download spreadsheet data as CSV
  const handleDownload = () => {
    const rowData = spreadsheet.getRowData();
    if (rowData.length === 0) {
      toast.error('Nenhum dado para baixar.');
      return;
    }

    // Build CSV content
    const csvHeaders = fieldConfigs.map(f => f.label);
    const csvRows = [csvHeaders.join(',')];

    rowData.forEach(row => {
      const values = fieldConfigs.map(field => {
        const value = row.data[field.key];
        // Escape quotes and wrap in quotes if contains comma
        const strValue = String(value ?? '');
        if (
          strValue.includes(',') ||
          strValue.includes('"') ||
          strValue.includes('\n')
        ) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `templates_import_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Planilha baixada com sucesso!');
  };

  return (
    <PageLayout backgroundVariant="none" maxWidth="full">
      <Header
        title="Importar Templates"
        description="Preencha a planilha ou cole dados do Excel (Ctrl+V)"
        buttons={[
          {
            id: 'back',
            title: 'Voltar',
            icon: ArrowLeft,
            variant: 'outline',
            onClick: () => router.push('/import/templates'),
          },
        ]}
      />

      {/* Entity info banner */}
      <Card className="mb-4 border-violet-500/30 bg-violet-500/5">
        <CardContent className="flex items-center gap-3 py-3">
          <LayoutTemplate className="w-5 h-5 text-violet-500" />
          <div>
            <span className="font-medium">Importando: </span>
            <span className="text-muted-foreground">Templates de Produtos</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            {fieldConfigs.length} campos
          </Badge>
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
        headers={fieldConfigs}
        onDataChange={spreadsheet.setData}
        onAddRow={spreadsheet.addRow}
        onClearAll={spreadsheet.clearAll}
        onDownload={handleDownload}
        validationResult={validationResult}
        referenceData={referenceDataMap}
        entityName="Templates"
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
