'use client';

/**
 * Hook para Impressão em Lote
 *
 * Permite imprimir múltiplas etiquetas/documentos de uma vez
 */

import { useCallback, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { BatchPrintConfig, PrintConfig, PrintOutputType } from '../types';
import { combinePagesToPdf, downloadPdf, openPdfInNewTab } from '../utils';

export const useBatchPrint = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const batchRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

  /**
   * Registra ref de um item para batch print
   */
  const registerBatchRef = useCallback(
    (id: string, element: HTMLDivElement | null) => {
      if (element) {
        batchRefsMap.current.set(id, element);
      } else {
        batchRefsMap.current.delete(id);
      }
    },
    []
  );

  /**
   * Processa impressão em lote
   */
  const batchPrint = useCallback(
    async (config: BatchPrintConfig, filename: string = 'lote.pdf') => {
      try {
        setIsProcessing(true);
        setProgress(0);

        const elements: HTMLDivElement[] = [];

        // Coleta todos os elementos, respeitando o número de cópias
        for (const item of config.items) {
          const element = batchRefsMap.current.get(item.id);
          if (!element) {
            logger.warn(`Elemento não encontrado para item ${item.id}`);
            continue;
          }

          const copies = item.copies || 1;
          for (let i = 0; i < copies; i++) {
            elements.push(element);
          }
        }

        if (elements.length === 0) {
          toast.error('Nenhum elemento encontrado para impressão');
          return { success: false };
        }

        const printConfig: PrintConfig = {
          format: config.template.format,
          orientation: config.template.orientation,
          outputType: config.outputType || PrintOutputType.PDF,
          ...config.template.defaultConfig,
          ...config.config,
        };

        // Gera PDF combinado
        const blob = await combinePagesToPdf(elements, printConfig, filename);

        setProgress(100);

        // Processa saída
        if (config.outputType === PrintOutputType.PDF) {
          await downloadPdf(blob, filename);
          toast.success(
            `${elements.length} item(ns) processado(s) com sucesso`
          );
        } else if (config.outputType === PrintOutputType.PREVIEW) {
          openPdfInNewTab(blob);
        }

        return { success: true, blob };
      } catch (error) {
        logger.error(
          'Erro na impressão em lote',
          error instanceof Error ? error : undefined
        );
        toast.error('Erro ao processar impressão em lote');
        return { success: false, error };
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    },
    []
  );

  /**
   * Limpa todos os refs registrados
   */
  const clearBatchRefs = useCallback(() => {
    batchRefsMap.current.clear();
  }, []);

  return {
    isProcessing,
    progress,
    batchPrint,
    registerBatchRef,
    clearBatchRefs,
  };
};
