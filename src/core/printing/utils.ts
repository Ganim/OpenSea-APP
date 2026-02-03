/**
 * Sistema de Impressão - Utilitários
 *
 * Funções auxiliares para manipulação de impressão, PDFs e códigos de barras
 */

import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { MM_TO_PT, MM_TO_PX, PAGE_DIMENSIONS, PDF_QUALITY } from './constants';
import {
  PrintConfig,
  PrintDimensions,
  PrintFormat,
  PrintOrientation,
} from './types';

// ==================== CONVERSÕES ====================

/**
 * Converte milímetros para pixels
 */
export const mmToPx = (mm: number): number => {
  return mm * MM_TO_PX;
};

/**
 * Converte milímetros para pontos (points)
 */
export const mmToPt = (mm: number): number => {
  return mm * MM_TO_PT;
};

/**
 * Converte pixels para milímetros
 */
export const pxToMm = (px: number): number => {
  return px / MM_TO_PX;
};

// ==================== DIMENSÕES ====================

/**
 * Obtém as dimensões de um formato de impressão
 */
export const getFormatDimensions = (
  format: PrintFormat,
  customDimensions?: PrintDimensions
): PrintDimensions => {
  if (format === PrintFormat.CUSTOM && customDimensions) {
    return customDimensions;
  }
  return PAGE_DIMENSIONS[format];
};

/**
 * Obtém as dimensões em pixels
 */
export const getFormatDimensionsPx = (
  format: PrintFormat,
  customDimensions?: PrintDimensions
): PrintDimensions => {
  const dimensions = getFormatDimensions(format, customDimensions);
  return {
    width: mmToPx(dimensions.width),
    height: mmToPx(dimensions.height),
  };
};

// ==================== CÓDIGO DE BARRAS ====================

/**
 * Gera código de barras como SVG string
 */
export const generateBarcodeSVG = (
  value: string,
  options?: {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontSize?: number;
  }
): string => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  JsBarcode(svg, value, {
    format: options?.format || 'CODE128',
    width: options?.width || 2,
    height: options?.height || 40,
    displayValue: options?.displayValue ?? true,
    fontSize: options?.fontSize || 12,
    margin: 0,
    background: 'transparent',
  });

  return new XMLSerializer().serializeToString(svg);
};

/**
 * Gera código de barras como Data URL
 */
export const generateBarcodeDataURL = (
  value: string,
  options?: {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontSize?: number;
  }
): string => {
  const canvas = document.createElement('canvas');

  JsBarcode(canvas, value, {
    format: options?.format || 'CODE128',
    width: options?.width || 2,
    height: options?.height || 40,
    displayValue: options?.displayValue ?? true,
    fontSize: options?.fontSize || 12,
    margin: 0,
    background: '#ffffff',
  });

  return canvas.toDataURL('image/png');
};

// ==================== PDF ====================

/**
 * Converte elemento HTML para PDF
 */
export const htmlToPdf = async (
  element: HTMLElement,
  config: PrintConfig,
  filename: string = 'document.pdf'
): Promise<Blob> => {
  const dimensions = getFormatDimensions(config.format, config.dimensions);
  const orientation = config.orientation || PrintOrientation.PORTRAIT;

  // Captura o elemento como canvas com alta qualidade
  const canvas = await html2canvas(element, {
    scale: PDF_QUALITY.PRINT.scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  // Cria PDF com dimensões corretas
  const pdf = new jsPDF({
    orientation:
      orientation === PrintOrientation.PORTRAIT ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [dimensions.width, dimensions.height],
  });

  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = dimensions.width;
  const pdfHeight = dimensions.height;

  // Adiciona imagem ao PDF
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

  return pdf.output('blob');
};

/**
 * Baixa PDF
 */
export const downloadPdf = async (
  blob: Blob,
  filename: string = 'document.pdf'
): Promise<void> => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Abre PDF em nova aba
 */
export const openPdfInNewTab = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

/**
 * Gera URL temporária para preview de PDF
 */
export const createPdfPreviewUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

// ==================== IMPRESSÃO DIRETA ====================

/**
 * Imprime elemento HTML diretamente
 */
export const printElement = (element: HTMLElement): void => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error('Não foi possível abrir janela de impressão');
  }

  // Copia estilos do documento atual
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Impressão</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; }
            @page { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Aguarda carregamento e imprime
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
};

// ==================== BATCH PRINTING ====================

/**
 * Combina múltiplas páginas em um único PDF
 */
export const combinePagesToPdf = async (
  elements: HTMLElement[],
  config: PrintConfig,
  filename: string = 'batch.pdf'
): Promise<Blob> => {
  const dimensions = getFormatDimensions(config.format, config.dimensions);
  const orientation = config.orientation || PrintOrientation.PORTRAIT;

  const pdf = new jsPDF({
    orientation:
      orientation === PrintOrientation.PORTRAIT ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [dimensions.width, dimensions.height],
  });

  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i], {
      scale: PDF_QUALITY.PRINT.scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      imgData,
      'PNG',
      0,
      0,
      dimensions.width,
      dimensions.height,
      undefined,
      'FAST'
    );
  }

  return pdf.output('blob');
};

// ==================== FORMATAÇÃO ====================

/**
 * Formata data para impressão
 */
export const formatPrintDate = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Valida se código de barras é válido
 */
export const isValidBarcode = (value: string): boolean => {
  return /^[0-9A-Z\-\.\/\+\$\s]+$/.test(value);
};
