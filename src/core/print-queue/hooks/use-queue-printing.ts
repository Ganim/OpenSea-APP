/**
 * Use Queue Printing Hook
 * Hook para gerenciar a geração de PDF e impressão da fila
 */

'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { SYSTEM_LABEL_TEMPLATES } from '../constants';
import { usePrintQueue } from '../context/print-queue-context';
import type { LabelData, PrintGenerationStatus } from '../types';
import { calculateLayout } from '../utils/page-layout-calculator';
import { resolveLabelData } from '../utils/label-data-resolver';

interface UseQueuePrintingResult {
  /** Status da geração */
  status: PrintGenerationStatus;

  /** Se está gerando PDF */
  isGenerating: boolean;

  /** Progresso da geração (0-100) */
  progress: number;

  /** Erro se houver */
  error: Error | null;

  /** Gerar PDF e abrir diálogo de impressão */
  printQueue: () => Promise<void>;

  /** Gerar PDF e fazer download */
  downloadPdf: (filename?: string) => Promise<void>;

  /** Gerar PDF e retornar blob */
  generatePdf: () => Promise<Blob | null>;
}

export function useQueuePrinting(): UseQueuePrintingResult {
  const { state, hasItems, totalLabels } = usePrintQueue();
  const [status, setStatus] = useState<PrintGenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const isGenerating = status === 'generating';

  // Gerar PDF
  const generatePdf = useCallback(async (): Promise<Blob | null> => {
    if (!hasItems) {
      toast.error('Nenhum item na fila');
      return null;
    }

    const template = SYSTEM_LABEL_TEMPLATES.find(
      t => t.id === state.selectedTemplateId
    );

    if (!template) {
      toast.error('Template nao encontrado');
      return null;
    }

    setStatus('generating');
    setProgress(0);
    setError(null);

    try {
      // 1. Resolver dados das etiquetas
      setProgress(10);
      const labelDataList: LabelData[] = [];

      for (const queueItem of state.items) {
        const data = resolveLabelData(
          queueItem.item,
          queueItem.variant,
          queueItem.product
        );
        // Adicionar cópias
        for (let i = 0; i < queueItem.copies; i++) {
          labelDataList.push(data);
        }
      }

      setProgress(30);

      // 2. Calcular layout
      const layout = calculateLayout(
        labelDataList,
        template,
        state.pageSettings
      );

      setProgress(50);

      // 3. Gerar PDF usando jsPDF
      const { jsPDF } = await import('jspdf');
      const JsBarcode = (await import('jsbarcode')).default;
      const QRCode = await import('qrcode');

      const doc = new jsPDF({
        orientation: state.pageSettings.orientation,
        unit: 'mm',
        format:
          state.pageSettings.paperSize === 'CUSTOM'
            ? [
                state.pageSettings.customDimensions?.width || 210,
                state.pageSettings.customDimensions?.height || 297,
              ]
            : state.pageSettings.paperSize.toLowerCase(),
      });

      setProgress(60);

      // 4. Renderizar cada página
      for (let pageIndex = 0; pageIndex < layout.pages.length; pageIndex++) {
        if (pageIndex > 0) {
          doc.addPage();
        }

        const page = layout.pages[pageIndex];

        for (const { position, data } of page.labels) {
          // Desenhar borda da etiqueta (opcional, para debug)
          // doc.rect(position.x, position.y, position.width, position.height);

          // Desenhar conteúdo da etiqueta
          await renderLabelToPdf(
            doc,
            data,
            position,
            template,
            JsBarcode,
            QRCode
          );
        }

        // Atualizar progresso
        setProgress(60 + Math.round((pageIndex / layout.pages.length) * 30));
      }

      setProgress(95);

      // 5. Converter para blob
      const blob = doc.output('blob');

      setProgress(100);
      setStatus('success');

      return blob;
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError(err as Error);
      setStatus('error');
      toast.error('Erro ao gerar PDF');
      return null;
    }
  }, [hasItems, state, totalLabels]);

  // Imprimir
  const printQueue = useCallback(async () => {
    const blob = await generatePdf();
    if (!blob) return;

    // Abrir em nova aba para impressão
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      // Fallback se popup bloqueado
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
    }

    // Limpar URL após um tempo
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, [generatePdf]);

  // Download
  const downloadPdf = useCallback(
    async (filename: string = 'etiquetas.pdf') => {
      const blob = await generatePdf();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF gerado com sucesso');
    },
    [generatePdf]
  );

  return {
    status,
    isGenerating,
    progress,
    error,
    printQueue,
    downloadPdf,
    generatePdf,
  };
}

// ============================================
// HELPER: RENDER LABEL TO PDF
// ============================================

async function renderLabelToPdf(
  doc: import('jspdf').jsPDF,
  data: LabelData,
  position: { x: number; y: number; width: number; height: number },
  template: (typeof SYSTEM_LABEL_TEMPLATES)[number],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  JsBarcode: any,
  QRCode: typeof import('qrcode')
) {
  const { x, y, width, height } = position;
  const padding = 2;
  const contentX = x + padding;
  const contentY = y + padding;
  const contentWidth = width - padding * 2;
  const contentHeight = height - padding * 2;

  // Definir fonte
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');

  const isSmall = width <= 35;
  const isLarge = width >= 80;

  if (isSmall) {
    // Layout pequeno
    doc.setFontSize(5);
    doc.text(data.itemCode.slice(0, 12), contentX, contentY + 3);
    doc.text(data.stockLocation.slice(0, 10), contentX, contentY + 6);

    // Barcode pequeno
    try {
      const barcodeCanvas = document.createElement('canvas');
      JsBarcode(barcodeCanvas, data.barcodeData, {
        format: 'CODE128',
        width: 1,
        height: 10,
        displayValue: false,
        margin: 0,
      });
      const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');
      doc.addImage(
        barcodeDataUrl,
        'PNG',
        contentX,
        contentY + 8,
        contentWidth,
        8
      );
    } catch (e) {
      console.error('Erro ao gerar barcode:', e);
    }
  } else if (isLarge) {
    // Layout grande
    doc.setFontSize(6);

    // Manufacturer
    if (data.manufacturerName) {
      doc.setTextColor(128, 128, 128);
      doc.text(data.manufacturerName.slice(0, 30), contentX, contentY + 4);
    }

    // Product name
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(data.productName.slice(0, 25), contentX, contentY + 9);

    // Variant
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(data.variantName.slice(0, 25), contentX, contentY + 14);

    // Reference
    if (data.variantReference) {
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text(`Ref: ${data.variantReference}`, contentX, contentY + 18);
    }

    // Location & Quantity
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text(data.stockLocation, contentX, contentY + contentHeight - 4);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    const qtyText = `${data.itemQuantity} ${data.itemUnitOfMeasure}`;
    doc.text(
      qtyText,
      contentX + contentWidth - doc.getTextWidth(qtyText),
      contentY + contentHeight - 4
    );

    // QR Code
    try {
      const qrDataUrl = await QRCode.toDataURL(data.qrCodeData, {
        width: 80,
        margin: 0,
      });
      const qrSize = Math.min(contentHeight - 10, 25);
      doc.addImage(
        qrDataUrl,
        'PNG',
        contentX + contentWidth - qrSize - 2,
        contentY + 2,
        qrSize,
        qrSize
      );
    } catch (e) {
      console.error('Erro ao gerar QR code:', e);
    }

    // Item code
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(
      data.itemCode,
      contentX + contentWidth - 2,
      contentY + contentHeight - 10,
      { align: 'right' }
    );
  } else {
    // Layout médio
    doc.setFontSize(6);

    // Product name
    doc.setFont('helvetica', 'bold');
    doc.text(data.productName.slice(0, 20), contentX, contentY + 4);

    // Location
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const locationText = data.stockLocation.slice(0, 10);
    doc.text(
      locationText,
      contentX + contentWidth - doc.getTextWidth(locationText),
      contentY + 4
    );

    // Variant
    doc.setTextColor(80, 80, 80);
    doc.text(data.variantName.slice(0, 20), contentX, contentY + 8);

    // Barcode
    try {
      const barcodeCanvas = document.createElement('canvas');
      JsBarcode(barcodeCanvas, data.barcodeData, {
        format: 'CODE128',
        width: 1,
        height: 15,
        displayValue: false,
        margin: 0,
      });
      const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');
      doc.addImage(
        barcodeDataUrl,
        'PNG',
        contentX,
        contentY + 10,
        contentWidth,
        10
      );
    } catch (e) {
      console.error('Erro ao gerar barcode:', e);
    }

    // Item code & Quantity
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(5);
    doc.text(
      data.itemCode.slice(0, 15),
      contentX,
      contentY + contentHeight - 1
    );
    const qtyText = `${data.itemQuantity} ${data.itemUnitOfMeasure}`;
    doc.text(
      qtyText,
      contentX + contentWidth - doc.getTextWidth(qtyText),
      contentY + contentHeight - 1
    );
  }
}
