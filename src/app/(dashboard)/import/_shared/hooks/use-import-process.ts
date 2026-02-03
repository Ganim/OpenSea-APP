'use client';

import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import type {
  ImportProgress,
  ImportStatus,
  ImportRowData,
  ImportResult,
  ImportResultRow,
  ImportEntityType,
} from '../types';
import { ENTITY_DEFINITIONS } from '../config/entity-definitions';

interface UseImportProcessOptions {
  entityType: ImportEntityType;
  batchSize?: number;
  delayBetweenBatches?: number;
  delayBetweenItems?: number;
  maxRetries?: number;
  /** Transform row data before sending to API (e.g., inject templateId) */
  transformRow?: (row: ImportRowData) => ImportRowData;
  onProgress?: (progress: ImportProgress) => void;
  onComplete?: (result: ImportResult) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_DELAY_BETWEEN_BATCHES = 1000;
const DEFAULT_DELAY_BETWEEN_ITEMS = 100;
const DEFAULT_MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 5000;

// ============================================
// HELPER FUNCTIONS
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================
// HOOK
// ============================================

export function useImportProcess(options: UseImportProcessOptions) {
  const {
    entityType,
    batchSize = DEFAULT_BATCH_SIZE,
    delayBetweenBatches = DEFAULT_DELAY_BETWEEN_BATCHES,
    delayBetweenItems = DEFAULT_DELAY_BETWEEN_ITEMS,
    maxRetries = DEFAULT_MAX_RETRIES,
    transformRow,
    onProgress,
    onComplete,
    onError,
  } = options;

  const [progress, setProgress] = useState<ImportProgress>({
    status: 'idle',
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: 0,
    errors: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const pendingRowsRef = useRef<ImportRowData[]>([]);

  const entityDef = ENTITY_DEFINITIONS[entityType];
  const apiEndpoint = entityDef?.apiEndpoint ?? `/v1/${entityType}`;

  // Atualizar progresso
  const updateProgress = useCallback(
    (
      updates:
        | Partial<ImportProgress>
        | ((prev: ImportProgress) => Partial<ImportProgress>)
    ) => {
      setProgress(prev => {
        const partialUpdates =
          typeof updates === 'function' ? updates(prev) : updates;
        const newProgress = { ...prev, ...partialUpdates };
        onProgress?.(newProgress);
        return newProgress;
      });
    },
    [onProgress]
  );

  // Importar um único item
  const importSingleItem = async (
    row: ImportRowData,
    retryCount = 0
  ): Promise<ImportResultRow> => {
    try {
      // Apply transform if provided (e.g., inject templateId)
      const transformedRow = transformRow ? transformRow(row) : row;
      const response = await apiClient.post(apiEndpoint, transformedRow.data);

      return {
        rowIndex: row.rowIndex,
        success: true,
        entityId: (response as { id?: string }).id,
      };
    } catch (error) {
      const err = error as { status?: number; message?: string };

      // Rate limit - retry após delay
      if (err.status === 429 && retryCount < maxRetries) {
        await delay(RATE_LIMIT_DELAY * (retryCount + 1));
        return importSingleItem(row, retryCount + 1);
      }

      // Outros erros - tentar novamente
      if (retryCount < maxRetries && err.status && err.status >= 500) {
        await delay(1000 * (retryCount + 1));
        return importSingleItem(row, retryCount + 1);
      }

      return {
        rowIndex: row.rowIndex,
        success: false,
        error: err.message || 'Erro desconhecido',
      };
    }
  };

  // Processar um batch
  const processBatch = async (
    batch: ImportRowData[],
    batchIndex: number,
    totalBatches: number
  ): Promise<ImportResultRow[]> => {
    const results: ImportResultRow[] = [];

    for (const row of batch) {
      // Verificar se foi pausado ou cancelado
      if (isPausedRef.current) {
        pendingRowsRef.current = batch.slice(batch.indexOf(row));
        throw new Error('PAUSED');
      }

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('CANCELLED');
      }

      const result = await importSingleItem(row);
      results.push(result);

      // Atualizar progresso usando função para garantir valor correto
      updateProgress(prev => ({
        processed: prev.processed + 1,
        successful: result.success ? prev.successful + 1 : prev.successful,
        failed: result.success ? prev.failed : prev.failed + 1,
        currentBatch: batchIndex + 1,
        errors: result.success
          ? prev.errors
          : [
              ...prev.errors,
              {
                row: row.rowIndex,
                message: result.error || 'Erro',
                data: row.data,
              },
            ],
      }));

      // Delay entre items
      if (batch.indexOf(row) < batch.length - 1) {
        await delay(delayBetweenItems);
      }
    }

    return results;
  };

  // Iniciar importação
  const startImport = useCallback(
    async (rows: ImportRowData[]): Promise<ImportResult> => {
      if (rows.length === 0) {
        return {
          success: true,
          totalRows: 0,
          importedRows: 0,
          skippedRows: 0,
          failedRows: 0,
          results: [],
          createdIds: [],
        };
      }

      abortControllerRef.current = new AbortController();
      isPausedRef.current = false;
      pendingRowsRef.current = [];

      const batches = chunkArray(rows, batchSize);
      const allResults: ImportResultRow[] = [];

      updateProgress({
        status: 'importing',
        total: rows.length,
        processed: 0,
        successful: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches: batches.length,
        errors: [],
        startedAt: new Date(),
      });

      try {
        for (let i = 0; i < batches.length; i++) {
          const batchResults = await processBatch(
            batches[i],
            i,
            batches.length
          );
          allResults.push(...batchResults);

          // Delay entre batches
          if (i < batches.length - 1) {
            await delay(delayBetweenBatches);
          }
        }

        const result: ImportResult = {
          success: allResults.every(r => r.success),
          totalRows: rows.length,
          importedRows: allResults.filter(r => r.success).length,
          skippedRows: 0,
          failedRows: allResults.filter(r => !r.success).length,
          results: allResults,
          createdIds: allResults
            .filter(r => r.success && r.entityId)
            .map(r => r.entityId!),
        };

        updateProgress({
          status: 'completed',
          completedAt: new Date(),
        });

        onComplete?.(result);
        return result;
      } catch (error) {
        const err = error as Error;

        if (err.message === 'PAUSED') {
          updateProgress({ status: 'paused' });
          return {
            success: false,
            totalRows: rows.length,
            importedRows: allResults.filter(r => r.success).length,
            skippedRows: 0,
            failedRows: allResults.filter(r => !r.success).length,
            results: allResults,
            createdIds: allResults
              .filter(r => r.success && r.entityId)
              .map(r => r.entityId!),
          };
        }

        if (err.message === 'CANCELLED') {
          updateProgress({ status: 'cancelled' });
          return {
            success: false,
            totalRows: rows.length,
            importedRows: allResults.filter(r => r.success).length,
            skippedRows: 0,
            failedRows: allResults.filter(r => !r.success).length,
            results: allResults,
            createdIds: allResults
              .filter(r => r.success && r.entityId)
              .map(r => r.entityId!),
          };
        }

        updateProgress(prev => ({
          status: 'failed',
          errors: [...prev.errors, { row: 0, message: err.message }],
        }));

        onError?.(err);
        throw err;
      }
    },
    [
      batchSize,
      delayBetweenBatches,
      delayBetweenItems,
      apiEndpoint,
      updateProgress,
      onComplete,
      onError,
      transformRow,
      maxRetries,
    ]
  );

  // Pausar importação
  const pauseImport = useCallback(() => {
    isPausedRef.current = true;
    updateProgress({ status: 'paused' });
  }, [updateProgress]);

  // Resumir importação
  const resumeImport = useCallback(async () => {
    if (pendingRowsRef.current.length === 0) return;

    isPausedRef.current = false;
    updateProgress({ status: 'importing' });

    // Continuar com as linhas pendentes
    const remainingRows = pendingRowsRef.current;
    pendingRowsRef.current = [];

    await startImport(remainingRows);
  }, [startImport, updateProgress]);

  // Cancelar importação
  const cancelImport = useCallback(() => {
    abortControllerRef.current?.abort();
    isPausedRef.current = false;
    pendingRowsRef.current = [];
    updateProgress({ status: 'cancelled' });
  }, [updateProgress]);

  // Resetar estado
  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    isPausedRef.current = false;
    pendingRowsRef.current = [];
    setProgress({
      status: 'idle',
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches: 0,
      errors: [],
    });
  }, []);

  return {
    progress,
    startImport,
    pauseImport,
    resumeImport,
    cancelImport,
    reset,
    isProcessing: progress.status === 'importing',
    isPaused: progress.status === 'paused',
    isCompleted: progress.status === 'completed',
    isFailed: progress.status === 'failed',
    isCancelled: progress.status === 'cancelled',
  };
}
