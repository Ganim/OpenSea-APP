/**
 * Print Queue Modal
 * Modal principal da fila de impressão
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Loader2, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePrintQueue } from '../context/print-queue-context';
import { useQueuePrinting } from '../hooks/use-queue-printing';
import { LabelPreview } from './label-preview';
import { PagePreview } from './page-preview';
import { PageSettingsPanel } from './page-settings-panel';
import { QueueItemList } from './queue-item-list';
import { TemplateSelector } from './template-selector';

interface PrintQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrintQueueModal({ open, onOpenChange }: PrintQueueModalProps) {
  const { itemCount, totalLabels, hasItems, actions, state } = usePrintQueue();
  const { isGenerating, progress, printQueue, downloadPdf } =
    useQueuePrinting();
  const [previewMode, setPreviewMode] = useState<'label' | 'page'>('label');

  const handlePrint = async () => {
    await printQueue();
  };

  const handleDownload = async () => {
    await downloadPdf(`etiquetas-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-w-[95vw] w-full h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Fila de Impressao
            </DialogTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
              <span>
                {itemCount} item{itemCount !== 1 && 's'}
              </span>
              <span>•</span>
              <span>
                {totalLabels} etiqueta{totalLabels !== 1 && 's'}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {/* Left Column - Queue List */}
          <div className="w-1/2 flex flex-col border-r">
            {/* Queue header */}
            <div className="px-4 py-3 border-b bg-gray-50 dark:bg-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Itens na Fila</h3>
              {hasItems && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={actions.clearQueue}
                  className="h-7 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Limpar tudo
                </Button>
              )}
            </div>

            {/* Queue list */}
            <div className="flex-1 min-h-0">
              <QueueItemList />
            </div>
          </div>

          {/* Right Column - Settings & Preview */}
          <div className="w-1/2 flex flex-col overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Template Selector */}
              <TemplateSelector />

              <Separator />

              {/* Page Settings */}
              <PageSettingsPanel />

              <Separator />

              {/* Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Preview
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      variant={previewMode === 'label' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('label')}
                      className="h-7 text-xs"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Etiqueta
                    </Button>
                    <Button
                      variant={previewMode === 'page' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('page')}
                      className="h-7 text-xs"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Pagina
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                  {previewMode === 'label' ? (
                    <LabelPreview
                      templateId={state.selectedTemplateId}
                      dimensions={state.selectedTemplateDimensions}
                      scale={3}
                      maxWidth={400}
                      maxHeight={260}
                    />
                  ) : (
                    <PagePreview containerWidth={280} containerHeight={280} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50 dark:bg-white/5">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600 dark:text-white/60">
              Total: <strong>{totalLabels}</strong> etiqueta
              {totalLabels !== 1 && 's'}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Cancelar
              </Button>

              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!hasItems || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Gerar PDF
              </Button>

              <Button
                onClick={handlePrint}
                disabled={!hasItems || isGenerating}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4 mr-2" />
                )}
                Imprimir
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
