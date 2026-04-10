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
import { cn } from '@/lib/utils';
import {
  Download,
  FileText,
  Loader2,
  Monitor,
  Printer,
  Send,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePrintQueue } from '../context/print-queue-context';
import { useQueuePrinting } from '../hooks/use-queue-printing';
import { usePrintJobTracker } from '../hooks/use-print-job-tracker';
import { printJobsService } from '@/services/sales/print-jobs.service';
import type { RemotePrinter } from '@/types/sales';
import { LabelPreview } from './label-preview';
import { PagePreview } from './page-preview';
import { PageSettingsPanel } from './page-settings-panel';
import { PrintJobTracker } from './print-job-tracker';
import { QueueItemList } from './queue-item-list';
import { RemotePrinterSelector } from './remote-printer-selector';
import { TemplateSelector } from './template-selector';

type PrintDestination = 'local' | 'remote';

interface PrintQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrintQueueModal({ open, onOpenChange }: PrintQueueModalProps) {
  const { itemCount, totalLabels, hasItems, actions, state } = usePrintQueue();
  const { isGenerating, progress, printQueue, downloadPdf, generatePdf } =
    useQueuePrinting();
  const { addJob } = usePrintJobTracker();
  const [previewMode, setPreviewMode] = useState<'label' | 'page'>('label');
  const [destination, setDestination] = useState<PrintDestination>('local');
  const [selectedPrinter, setSelectedPrinter] = useState<RemotePrinter | null>(
    null
  );
  const [isSendingRemote, setIsSendingRemote] = useState(false);

  const handlePrint = async () => {
    if (destination === 'remote') {
      await handleRemotePrint();
    } else {
      await printQueue();
    }
  };

  const handleRemotePrint = async () => {
    if (!selectedPrinter) {
      toast.error('Selecione uma impressora remota');
      return;
    }

    setIsSendingRemote(true);
    try {
      const blob = await generatePdf();
      if (!blob) return;

      // Convert blob to base64
      const buffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const result = await printJobsService.create({
        printerId: selectedPrinter.id,
        content: base64,
        copies: 1,
      });

      addJob({
        jobId: result.jobId,
        printerName: selectedPrinter.name,
        copies: 1,
        status: 'QUEUED',
      });

      toast.success('Impressao enviada');
    } catch (err) {
      toast.error('Erro ao enviar impressao');
    } finally {
      setIsSendingRemote(false);
    }
  };

  const handleDownload = async () => {
    await downloadPdf(`etiquetas-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const isProcessing = isGenerating || isSendingRemote;

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

              {/* Destino da Impressao */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Destino da Impressao
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDestination('local')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all',
                      destination === 'local'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        : 'border-border hover:border-blue-300 dark:hover:border-blue-500/30'
                    )}
                  >
                    <Monitor className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-medium">Local (PDF)</p>
                      <p className="text-[10px] text-muted-foreground">
                        Abre dialogo do navegador
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => setDestination('remote')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all',
                      destination === 'remote'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        : 'border-border hover:border-blue-300 dark:hover:border-blue-500/30'
                    )}
                  >
                    <Send className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-medium">Impressora remota</p>
                      <p className="text-[10px] text-muted-foreground">
                        Envia para agente conectado
                      </p>
                    </div>
                  </button>
                </div>

                {destination === 'remote' && (
                  <RemotePrinterSelector
                    selectedPrinterId={selectedPrinter?.id ?? null}
                    onSelect={setSelectedPrinter}
                  />
                )}
              </div>

              <Separator />

              {/* Active Print Jobs */}
              <PrintJobTracker />

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
                disabled={isProcessing}
              >
                Cancelar
              </Button>

              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!hasItems || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Gerar PDF
              </Button>

              <Button
                onClick={handlePrint}
                disabled={
                  !hasItems ||
                  isProcessing ||
                  (destination === 'remote' && !selectedPrinter)
                }
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : destination === 'remote' ? (
                  <Send className="w-4 h-4 mr-2" />
                ) : (
                  <Printer className="w-4 h-4 mr-2" />
                )}
                {destination === 'remote' ? 'Enviar' : 'Imprimir'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
