'use client';

// ============================================
// CATALOG IMPORT WIZARD PAGE
// Importação unificada de Produtos + Variantes
// ============================================

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { WizardStepper, StepInfo } from './components/wizard-stepper';
import { StepUpload } from './components/step-upload';
import { StepTemplate } from './components/step-template';
import { StepMapping } from './components/step-mapping';
import { StepPreview } from './components/step-preview';
import { StepValidate } from './components/step-validate';
import { StepImport } from './components/step-import';
import { useCatalogImport, type WizardStep } from './hooks/use-catalog-import';

// ============================================
// PAGE COMPONENT
// ============================================

export default function CatalogImportPage() {
  const router = useRouter();
  const {
    state,
    step,
    canGoNext,
    canGoBack,
    nextStep,
    prevStep,
    goToStep,
    setFile,
    setParsedSheet,
    setSelectedSheetIndex,
    setTemplate,
    setColumnMapping,
    setGroupingColumn,
    setGroupedProducts,
    setValidationResult,
    setImportProgress,
    reset,
  } = useCatalogImport();

  // ============================================
  // HANDLERS
  // ============================================

  const handleCancel = () => {
    if (
      state.file ||
      state.template ||
      Object.keys(state.columnMapping.product).length > 0
    ) {
      if (
        window.confirm(
          'Tem certeza que deseja cancelar? Todo o progresso será perdido.'
        )
      ) {
        reset();
        router.push('/import');
      }
    } else {
      router.push('/import');
    }
  };

  const getCompletedSteps = (): WizardStep[] => {
    const completed: WizardStep[] = [];
    if (state.parsedSheet) completed.push(1);
    if (state.template) completed.push(2);
    if (
      state.columnMapping.groupingColumn &&
      Object.keys(state.columnMapping.product).length > 0
    ) {
      completed.push(3);
    }
    if (state.groupedProducts.length > 0) completed.push(4);
    if (state.validationResult?.valid) completed.push(5);
    if (state.importProgress.status === 'completed') completed.push(6);
    return completed;
  };

  // ============================================
  // RENDER STEP CONTENT
  // ============================================

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <StepUpload
            file={state.file}
            parsedSheet={state.parsedSheet}
            selectedSheetIndex={state.selectedSheetIndex}
            onFileChange={setFile}
            onParsedSheetChange={setParsedSheet}
            onSheetIndexChange={setSelectedSheetIndex}
          />
        );
      case 2:
        return (
          <StepTemplate
            selectedTemplate={state.template}
            onTemplateSelect={setTemplate}
          />
        );
      case 3:
        if (!state.parsedSheet || !state.template) {
          return (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Por favor, complete os passos anteriores primeiro.
                </p>
              </CardContent>
            </Card>
          );
        }
        return (
          <StepMapping
            parsedSheet={state.parsedSheet}
            template={state.template}
            columnMapping={state.columnMapping}
            onMappingChange={setColumnMapping}
            onGroupingColumnChange={setGroupingColumn}
          />
        );
      case 4:
        if (!state.parsedSheet || !state.template) {
          return (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Por favor, complete os passos anteriores primeiro.
                </p>
              </CardContent>
            </Card>
          );
        }
        return (
          <StepPreview
            parsedSheet={state.parsedSheet}
            columnMapping={state.columnMapping}
            groupedProducts={state.groupedProducts}
            onGroupedProductsChange={setGroupedProducts}
          />
        );
      case 5:
        if (!state.template || state.groupedProducts.length === 0) {
          return (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Por favor, complete os passos anteriores primeiro.
                </p>
              </CardContent>
            </Card>
          );
        }
        return (
          <StepValidate
            template={state.template}
            groupedProducts={state.groupedProducts}
            validationResult={state.validationResult}
            onValidationResultChange={setValidationResult}
          />
        );
      case 6:
        if (!state.template || !state.validationResult) {
          return (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Por favor, complete os passos anteriores primeiro.
                </p>
              </CardContent>
            </Card>
          );
        }
        return (
          <StepImport
            template={state.template}
            groupedProducts={state.groupedProducts}
            validationResult={state.validationResult}
            importProgress={state.importProgress}
            onImportProgressChange={setImportProgress}
          />
        );
      default:
        return null;
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Importar Catálogo
              </h1>
              <p className="text-sm text-muted-foreground">
                Produtos e Variantes em lote
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>

          {/* Stepper */}
          <WizardStepper
            currentStep={step}
            onStepClick={goToStep}
            completedSteps={getCompletedSteps()}
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Step info */}
        <div className="mb-6">
          <StepInfo step={step} />
        </div>

        {/* Step content */}
        <div className="mb-8">{renderStepContent()}</div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={prevStep} disabled={!canGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Passo {step} de 6
            </span>
          </div>

          <Button onClick={nextStep} disabled={!canGoNext}>
            {step === 6 ? 'Finalizar' : 'Próximo'}
            {step < 6 && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
