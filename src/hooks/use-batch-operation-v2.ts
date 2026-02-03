import { useCallback, useRef, useState } from 'react';

/**
 * Estados possíveis da operação em lote
 */
type OperationStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled';

/**
 * Resultado do processamento de um item
 */
interface ItemResult<T> {
  id: string;
  status: 'success' | 'failed';
  result?: T;
  error?: Error;
}

/**
 * Opções de configuração do hook
 */
interface BatchOperationOptions<T> {
  batchSize?: number;
  delayBetweenItems?: number;
  delayBetweenBatches?: number;
  maxRetries?: number;
  onComplete?: (results: ItemResult<T>[]) => void;
  onProgress?: (current: number, total: number) => void;
  onItemComplete?: (result: ItemResult<T>) => void;
}

/**
 * Estado retornado pelo hook
 */
interface BatchOperationState<T> {
  status: OperationStatus;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  progress: number;
  results: ItemResult<T>[];
  failedIds: string[];
}

/**
 * Função auxiliar para detectar rate limit
 */
function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('rate limit');
  }
  return false;
}

/**
 * Função auxiliar para extrair tempo de retry do erro
 */
function getRetryDelay(error: unknown, defaultDelay = 60000): number {
  if (error instanceof Error) {
    const match = error.message.match(/retry in (\d+) seconds?/i);
    if (match) {
      return parseInt(match[1]) * 1000;
    }
  }
  return defaultDelay;
}

/**
 * Hook para processar operações em lote com controle de taxa, retry e cancelamento
 */
export function useBatchOperation<T>(
  operationFn: (id: string) => Promise<T>,
  options: BatchOperationOptions<T> = {}
) {
  const {
    batchSize = 3,
    delayBetweenItems = 500,
    delayBetweenBatches = 2000,
    maxRetries = 3,
    onComplete,
    onProgress,
    onItemComplete,
  } = options;

  // Estado da operação
  const [state, setState] = useState<BatchOperationState<T>>({
    status: 'idle',
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    progress: 0,
    results: [],
    failedIds: [],
  });

  // Refs para controle de fluxo (não causam re-render)
  const controlRef = useRef({
    shouldCancel: false,
    shouldPause: false,
  });

  /**
   * Processa um único item com retry
   */
  const processItem = async (
    id: string,
    retryCount = 0
  ): Promise<ItemResult<T>> => {
    try {
      const result = await operationFn(id);
      return { id, status: 'success', result };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Erro desconhecido');

      // Se for rate limit e ainda temos retries, aguarda e tenta novamente
      if (isRateLimitError(error) && retryCount < maxRetries) {
        const delay = getRetryDelay(error);
        console.log(
          `Rate limit detectado para ${id}. Aguardando ${delay / 1000}s...`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        return processItem(id, retryCount + 1);
      }

      return { id, status: 'failed', error: err };
    }
  };

  /**
   * Atualiza o estado de forma segura
   */
  const updateState = useCallback(
    (updates: Partial<BatchOperationState<T>>) => {
      setState(prev => {
        const newState = { ...prev, ...updates };

        // Calcula o progresso baseado em items processados
        if (newState.total > 0) {
          newState.progress = Math.round(
            (newState.processed / newState.total) * 100
          );
        }

        return newState;
      });
    },
    []
  );

  /**
   * Inicia o processamento em lote
   */
  const start = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) {
        console.warn('Nenhum ID fornecido para processar');
        return;
      }

      // Reseta controles
      controlRef.current = {
        shouldCancel: false,
        shouldPause: false,
      };

      // Inicializa estado
      const totalBatches = Math.ceil(ids.length / batchSize);
      const allResults: ItemResult<T>[] = [];

      setState({
        status: 'running',
        total: ids.length,
        processed: 0,
        succeeded: 0,
        failed: 0,
        progress: 0,
        results: [],
        failedIds: [],
      });

      let currentIndex = 0;

      // Processa em lotes
      for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
        // Verifica cancelamento
        if (controlRef.current.shouldCancel) {
          console.log('Operação cancelada pelo usuário');
          break;
        }

        const batchStart = batchNum * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, ids.length);
        const batch = ids.slice(batchStart, batchEnd);

        // Processa cada item do lote sequencialmente
        for (const id of batch) {
          // Aguarda enquanto pausado
          while (
            controlRef.current.shouldPause &&
            !controlRef.current.shouldCancel
          ) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Verifica cancelamento novamente
          if (controlRef.current.shouldCancel) {
            break;
          }

          // Processa o item
          const result = await processItem(id);
          allResults.push(result);
          currentIndex++;

          // Callback de item completado (para invalidar cache incrementalmente)
          if (onItemComplete) {
            onItemComplete(result);
          }

          // Atualiza estado
          const succeeded = allResults.filter(
            r => r.status === 'success'
          ).length;
          const failed = allResults.filter(r => r.status === 'failed').length;
          const failedIds = allResults
            .filter(r => r.status === 'failed')
            .map(r => r.id);

          updateState({
            processed: currentIndex,
            succeeded,
            failed,
            results: [...allResults],
            failedIds,
          });

          // Callback de progresso
          if (onProgress) {
            onProgress(currentIndex, ids.length);
          }

          // Delay entre itens (exceto no último)
          if (currentIndex < ids.length) {
            await new Promise(resolve =>
              setTimeout(resolve, delayBetweenItems)
            );
          }
        }

        // Delay entre lotes (exceto no último)
        if (batchNum < totalBatches - 1 && !controlRef.current.shouldCancel) {
          await new Promise(resolve =>
            setTimeout(resolve, delayBetweenBatches)
          );
        }
      }

      // Finaliza operação
      const finalSucceeded = allResults.filter(
        r => r.status === 'success'
      ).length;
      const finalFailed = allResults.filter(r => r.status === 'failed').length;
      const finalFailedIds = allResults
        .filter(r => r.status === 'failed')
        .map(r => r.id);

      const finalStatus: OperationStatus = controlRef.current.shouldCancel
        ? 'cancelled'
        : 'completed';

      setState({
        status: finalStatus,
        total: ids.length,
        processed: currentIndex,
        succeeded: finalSucceeded,
        failed: finalFailed,
        progress: Math.round((currentIndex / ids.length) * 100),
        results: allResults,
        failedIds: finalFailedIds,
      });

      // Callback de conclusão
      if (onComplete) {
        onComplete(allResults);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      batchSize,
      delayBetweenItems,
      delayBetweenBatches,
      maxRetries,
      operationFn,
      onComplete,
      onProgress,
    ]
  );

  /**
   * Pausa a operação
   */
  const pause = useCallback(() => {
    if (state.status === 'running') {
      controlRef.current.shouldPause = true;
      setState(prev => ({ ...prev, status: 'paused' }));
    }
  }, [state.status]);

  /**
   * Retoma a operação
   */
  const resume = useCallback(() => {
    if (state.status === 'paused') {
      controlRef.current.shouldPause = false;
      setState(prev => ({ ...prev, status: 'running' }));
    }
  }, [state.status]);

  /**
   * Cancela a operação
   */
  const cancel = useCallback(() => {
    if (state.status === 'running' || state.status === 'paused') {
      controlRef.current.shouldCancel = true;
      controlRef.current.shouldPause = false;
    }
  }, [state.status]);

  /**
   * Reseta o estado para o inicial
   */
  const reset = useCallback(() => {
    controlRef.current = {
      shouldCancel: false,
      shouldPause: false,
    };

    setState({
      status: 'idle',
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      progress: 0,
      results: [],
      failedIds: [],
    });
  }, []);

  return {
    // Estado
    ...state,

    // Ações
    start,
    pause,
    resume,
    cancel,
    reset,

    // Helpers
    isRunning: state.status === 'running',
    isPaused: state.status === 'paused',
    isCompleted: state.status === 'completed',
    isCancelled: state.status === 'cancelled',
    isIdle: state.status === 'idle',
    hasErrors: state.failed > 0,
  };
}
