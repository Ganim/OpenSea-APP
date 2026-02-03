import { useCallback, useRef, useState } from 'react';

interface UseBatchOperationOptions<T> {
  batchSize?: number; // Tamanho do lote (padrão: 3)
  delayBetweenBatches?: number; // Delay entre lotes em ms (padrão: 1000ms)
  delayBetweenItems?: number; // Delay entre itens em ms (padrão: 200ms)
  maxRetries?: number; // Tentativas máximas por item (padrão: 3)
  onSuccess?: (results: T[]) => void;
  onError?: (error: Error, failedIds: string[]) => void;
  onCancel?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

interface BatchOperationState<T> {
  isProcessing: boolean;
  isPaused: boolean;
  progress: number; // 0-100
  total: number;
  completed: number;
  failed: string[];
  currentBatch: number;
  totalBatches: number;
  results: T[];
}

// Função auxiliar para detectar rate limit
function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('rate limit');
  }
  return false;
}

// Função auxiliar para extrair tempo de retry do erro
function getRetryDelay(error: unknown): number {
  if (error instanceof Error) {
    const match = error.message.match(/retry in (\d+) seconds?/i);
    if (match) {
      return parseInt(match[1]) * 1000; // Converte para ms
    }
  }
  return 60000; // Default: 60 segundos
}

export function useBatchOperation<T>(
  operationFunction: (id: string) => Promise<T>,
  options: UseBatchOperationOptions<T> = {}
) {
  const {
    batchSize = 3,
    delayBetweenBatches = 1000,
    delayBetweenItems = 200,
    maxRetries = 3,
    onSuccess,
    onError,
    onCancel,
    onPause,
    onResume,
  } = options;

  const [state, setState] = useState<BatchOperationState<T>>({
    isProcessing: false,
    isPaused: false,
    progress: 0,
    total: 0,
    completed: 0,
    failed: [],
    currentBatch: 0,
    totalBatches: 0,
    results: [],
  });

  const cancelRef = useRef(false);
  const pauseRef = useRef(false);

  const processBatch = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;

      cancelRef.current = false;
      pauseRef.current = false;
      const totalBatches = Math.ceil(ids.length / batchSize);

      setState({
        isProcessing: true,
        isPaused: false,
        progress: 0,
        total: ids.length,
        completed: 0,
        failed: [],
        currentBatch: 0,
        totalBatches,
        results: [],
      });

      const failed: string[] = [];
      const results: T[] = [];
      let completed = 0;

      // Função interna para tentar processar um item com retry
      const processWithRetry = async (
        id: string,
        retryCount = 0
      ): Promise<{ success: boolean; result?: T }> => {
        // Verifica se foi cancelado
        if (cancelRef.current) {
          return { success: false };
        }

        try {
          const result = await operationFunction(id);
          return { success: true, result };
        } catch (error) {
          // Se for rate limit, aguarda e tenta novamente
          if (isRateLimitError(error) && retryCount < maxRetries) {
            const retryDelay = getRetryDelay(error);
            console.log(
              `Rate limit detectado. Aguardando ${retryDelay / 1000}s antes de tentar novamente...`
            );
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return processWithRetry(id, retryCount + 1);
          }

          // Se não for rate limit ou excedeu tentativas, falha
          return { success: false };
        }
      };

      // Processa em lotes MENORES e mais LENTOS
      for (let i = 0; i < ids.length; i += batchSize) {
        // Verifica se foi cancelado
        if (cancelRef.current) {
          break;
        }

        const currentBatchNum = Math.floor(i / batchSize) + 1;
        const batch = ids.slice(i, i + batchSize);

        // Atualiza batch atual
        setState(prev => ({
          ...prev,
          currentBatch: currentBatchNum,
        }));

        // Processa itens do lote SEQUENCIALMENTE para evitar rate limit
        for (const id of batch) {
          // Aguarda enquanto estiver pausado
          while (pauseRef.current) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Verifica se foi cancelado
          if (cancelRef.current) {
            break;
          }

          const result = await processWithRetry(id);

          if (result.success && result.result) {
            completed++;
            results.push(result.result);
          } else {
            failed.push(id);
          }

          // Atualiza progresso após cada item
          const progress = Math.round(
            ((completed + failed.length) / ids.length) * 100
          );
          setState({
            isProcessing: true,
            isPaused: pauseRef.current,
            progress,
            total: ids.length,
            completed,
            failed: [...failed],
            currentBatch: currentBatchNum,
            totalBatches,
            results: [...results],
          });

          // Pequeno delay entre cada requisição
          await new Promise(resolve => setTimeout(resolve, delayBetweenItems));
        }

        // Delay maior entre lotes
        if (i + batchSize < ids.length) {
          await new Promise(resolve =>
            setTimeout(resolve, delayBetweenBatches)
          );
        }
      }

      // Finaliza
      const wasCancelled = cancelRef.current;
      const finalProgress = Math.round(
        ((completed + failed.length) / ids.length) * 100
      );
      setState({
        isProcessing: false,
        isPaused: false,
        progress: wasCancelled ? finalProgress : 100,
        total: ids.length,
        completed,
        failed: wasCancelled
          ? [...failed, ...ids.slice(completed + failed.length)]
          : failed,
        currentBatch: totalBatches,
        totalBatches,
        results,
      });

      if (wasCancelled && onCancel) {
        onCancel();
      } else if (failed.length > 0 && onError) {
        onError(new Error(`Falha ao processar ${failed.length} itens`), failed);
      } else if (failed.length === 0 && onSuccess) {
        onSuccess(results);
      }
    },
    [
      batchSize,
      delayBetweenBatches,
      delayBetweenItems,
      maxRetries,
      operationFunction,
      onSuccess,
      onError,
      onCancel,
    ]
  );

  const pause = useCallback(() => {
    pauseRef.current = true;
    setState(prev => ({ ...prev, isPaused: true }));
    if (onPause) {
      onPause();
    }
  }, [onPause]);

  const resume = useCallback(() => {
    pauseRef.current = false;
    setState(prev => ({ ...prev, isPaused: false }));
    if (onResume) {
      onResume();
    }
  }, [onResume]);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const reset = useCallback(() => {
    cancelRef.current = false;
    pauseRef.current = false;
    setState({
      isProcessing: false,
      isPaused: false,
      progress: 0,
      total: 0,
      completed: 0,
      failed: [],
      currentBatch: 0,
      totalBatches: 0,
      results: [],
    });
  }, []);

  return {
    ...state,
    processBatch,
    pause,
    resume,
    cancel,
    reset,
  };
}
