'use client';

/**
 * Sistema de Impressão - Hook Principal
 *
 * Hook customizado para gerenciar impressão e geração de PDFs
 */

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  PrintConfig,
  PrintOutputType,
  PrintResult,
  UsePrintOptions,
} from '../types';
import {
  downloadPdf,
  htmlToPdf,
  openPdfInNewTab,
  printElement,
} from '../utils';

export const usePrint = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  /**
   * Gera PDF a partir do elemento
   */
  const generatePdf = useCallback(
    async (config: PrintConfig, filename?: string): Promise<Blob | null> => {
      if (!printRef.current) {
        toast.error('Elemento de impressão não encontrado');
        return null;
      }

      try {
        setIsProcessing(true);
        const blob = await htmlToPdf(printRef.current, config, filename);
        return blob;
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        toast.error('Erro ao gerar PDF');
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  /**
   * Baixa PDF
   */
  const handleDownloadPdf = useCallback(
    async (config: PrintConfig, filename: string = 'documento.pdf') => {
      const blob = await generatePdf(config, filename);
      if (blob) {
        await downloadPdf(blob, filename);
        toast.success('PDF baixado com sucesso');
      }
    },
    [generatePdf]
  );

  /**
   * Abre PDF em nova aba
   */
  const handleOpenPdf = useCallback(
    async (config: PrintConfig) => {
      const blob = await generatePdf(config);
      if (blob) {
        openPdfInNewTab(blob);
      }
    },
    [generatePdf]
  );

  /**
   * Imprime diretamente
   */
  const handleDirectPrint = useCallback(() => {
    if (!printRef.current) {
      toast.error('Elemento de impressão não encontrado');
      return;
    }

    try {
      setIsProcessing(true);
      printElement(printRef.current);
      toast.success('Documento enviado para impressão');
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast.error('Erro ao imprimir documento');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Função principal de impressão
   */
  const print = useCallback(
    async (config: PrintConfig, filename?: string): Promise<PrintResult> => {
      try {
        setIsProcessing(true);

        switch (config.outputType) {
          case PrintOutputType.PDF:
            const blob = await generatePdf(config, filename);
            if (blob) {
              const url = URL.createObjectURL(blob);
              setPdfUrl(url);
              await downloadPdf(blob, filename || 'documento.pdf');
              return { success: true, pdfUrl: url };
            }
            return { success: false, error: new Error('Falha ao gerar PDF') };

          case PrintOutputType.DIRECT_PRINT:
            handleDirectPrint();
            return { success: true };

          case PrintOutputType.PREVIEW:
            const previewBlob = await generatePdf(config, filename);
            if (previewBlob) {
              const url = URL.createObjectURL(previewBlob);
              setPdfUrl(url);
              return { success: true, pdfUrl: url };
            }
            return {
              success: false,
              error: new Error('Falha ao gerar preview'),
            };

          default:
            return {
              success: false,
              error: new Error('Tipo de saída inválido'),
            };
        }
      } catch (error) {
        console.error('Erro na impressão:', error);
        return {
          success: false,
          error:
            error instanceof Error ? error : new Error('Erro desconhecido'),
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [generatePdf, handleDirectPrint]
  );

  /**
   * Limpa URL do PDF (libera memória)
   */
  const clearPdfUrl = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [pdfUrl]);

  return {
    printRef,
    isProcessing,
    pdfUrl,
    print,
    generatePdf,
    downloadPdf: handleDownloadPdf,
    openPdf: handleOpenPdf,
    directPrint: handleDirectPrint,
    clearPdfUrl,
  };
};

/**
 * Hook especializado para impressão com template
 */
export const usePrintWithTemplate = <T = any>(options: UsePrintOptions) => {
  const { template, data, config, onSuccess, onError } = options;
  const printHook = usePrint();

  const printWithTemplate = useCallback(async () => {
    try {
      const printConfig: PrintConfig = {
        format: template.format,
        orientation: template.orientation,
        outputType: PrintOutputType.PDF,
        ...template.defaultConfig,
        ...config,
      };

      const result = await printHook.print(printConfig);

      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(result.error || new Error('Erro desconhecido'));
      }

      return result;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Erro desconhecido');
      onError?.(err);
      return { success: false, error: err };
    }
  }, [template, data, config, onSuccess, onError, printHook]);

  return {
    ...printHook,
    printWithTemplate,
  };
};
