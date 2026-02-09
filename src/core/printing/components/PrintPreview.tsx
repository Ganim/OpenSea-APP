'use client';

/**
 * Componente de Preview de Impressão
 *
 * Modal com preview, opções de impressão e exportação PDF
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, Eye, Printer, X } from 'lucide-react';
import { useState } from 'react';
import { usePrint } from '../hooks/usePrint';
import {
  PrintConfig,
  PrintOrientation,
  PrintOutputType,
  PrintTemplate,
} from '../types';

interface PrintPreviewProps<T = unknown> {
  isOpen: boolean;
  onClose: () => void;
  template: PrintTemplate<T>;
  data: T;
  config?: Partial<PrintConfig>;
  filename?: string;
}

export function PrintPreview<T = unknown>({
  isOpen,
  onClose,
  template,
  data,
  config,
  filename = 'documento.pdf',
}: PrintPreviewProps<T>) {
  const { printRef, isProcessing, downloadPdf, openPdf, directPrint } =
    usePrint();

  const [outputType, setOutputType] = useState<PrintOutputType>(
    PrintOutputType.PDF
  );

  const [orientation, setOrientation] = useState<PrintOrientation>(
    config?.orientation || template.orientation || PrintOrientation.PORTRAIT
  );

  const printConfig: PrintConfig = {
    format: template.format,
    orientation,
    outputType,
    ...template.defaultConfig,
    ...config,
  };

  const handlePrint = async () => {
    switch (outputType) {
      case PrintOutputType.PDF:
        await downloadPdf(printConfig, filename);
        break;
      case PrintOutputType.DIRECT_PRINT:
        directPrint();
        break;
      case PrintOutputType.PREVIEW:
        await openPdf(printConfig);
        break;
    }
  };

  const TemplateComponent = template.component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Preview de Impressão - {template.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Controle */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tipo de Saída */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tipo de Saída</Label>
              <RadioGroup
                value={outputType}
                onValueChange={value => setOutputType(value as PrintOutputType)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={PrintOutputType.PDF} id="pdf" />
                  <Label htmlFor="pdf" className="cursor-pointer">
                    <Download className="inline h-4 w-4 mr-1" />
                    Baixar PDF
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={PrintOutputType.PREVIEW}
                    id="preview"
                  />
                  <Label htmlFor="preview" className="cursor-pointer">
                    <Eye className="inline h-4 w-4 mr-1" />
                    Abrir PDF
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={PrintOutputType.DIRECT_PRINT}
                    id="print"
                  />
                  <Label htmlFor="print" className="cursor-pointer">
                    <Printer className="inline h-4 w-4 mr-1" />
                    Imprimir Direto
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Orientação */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Orientação</Label>
              <RadioGroup
                value={orientation}
                onValueChange={value =>
                  setOrientation(value as PrintOrientation)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={PrintOrientation.PORTRAIT}
                    id="portrait"
                  />
                  <Label htmlFor="portrait" className="cursor-pointer">
                    Retrato
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={PrintOrientation.LANDSCAPE}
                    id="landscape"
                  />
                  <Label htmlFor="landscape" className="cursor-pointer">
                    Paisagem
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Informações */}
            <div className="p-3 bg-muted rounded-md text-sm space-y-1">
              <p>
                <strong>Formato:</strong> {template.format}
              </p>
              <p>
                <strong>Arquivo:</strong> {filename}
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2">
              <Button
                onClick={handlePrint}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  'Processando...'
                ) : outputType === PrintOutputType.PDF ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </>
                ) : outputType === PrintOutputType.PREVIEW ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Abrir Preview
                  </>
                ) : (
                  <>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div
                className="bg-white shadow-lg mx-auto"
                style={{ maxWidth: 'fit-content' }}
              >
                <div ref={printRef}>
                  <TemplateComponent data={data} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
