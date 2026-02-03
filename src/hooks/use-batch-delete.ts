import { useCallback, useState } from 'react';

interface UseBatchDeleteOptions {
  batchSize?: number; // Tamanho do lote (padrão: 3)
  delayBetweenBatches?: number; // Delay entre lotes em ms (padrão: 1000ms)
  maxRetries?: number; // Tentativas máximas por item (padrão: 3)
  onSuccess?: () => void;
  onError?: (error: Error, failedIds: string[]) => void;
}

interface BatchDeleteState {
  isDeleting: boolean;
  progress: number; // 0-100
  total: number;
  completed: number;
  failed: string[];
  currentBatch: number;
  totalBatches: number;
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

export function useBatchDelete(
  deleteFunction: (id: string) => Promise<void>,
  options: UseBatchDeleteOptions = {}
) {
  const {
    batchSize = 3,
    delayBetweenBatches = 1000,
    maxRetries = 3,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<BatchDeleteState>({
    isDeleting: false,
    progress: 0,
    total: 0,
    completed: 0,
    failed: [],
    currentBatch: 0,
    totalBatches: 0,
  });

  const deleteBatch = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;

      const totalBatches = Math.ceil(ids.length / batchSize);

      setState({
        isDeleting: true,
        progress: 0,
        total: ids.length,
        completed: 0,
        failed: [],
        currentBatch: 0,
        totalBatches,
      });

      const failed: string[] = [];
      let completed = 0;

      // Função interna para tentar excluir um item com retry
      const deleteWithRetry = async (
        id: string,
        retryCount = 0
      ): Promise<{ success: boolean }> => {
        try {
          await deleteFunction(id);
          return { success: true };
        } catch (error) {
          // Se for rate limit, aguarda e tenta novamente
          if (isRateLimitError(error) && retryCount < maxRetries) {
            const retryDelay = getRetryDelay(error);
            console.log(
              `Rate limit detectado. Aguardando ${retryDelay / 1000}s antes de tentar novamente...`
            );
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return deleteWithRetry(id, retryCount + 1);
          }

          // Se não for rate limit ou excedeu tentativas, falha
          return { success: false };
        }
      };

      // Processa em lotes MENORES e mais LENTOS
      for (let i = 0; i < ids.length; i += batchSize) {
        const currentBatchNum = Math.floor(i / batchSize) + 1;
        const batch = ids.slice(i, i + batchSize);

        // Atualiza batch atual
        setState(prev => ({
          ...prev,
          currentBatch: currentBatchNum,
        }));

        // Processa itens do lote SEQUENCIALMENTE para evitar rate limit
        for (const id of batch) {
          const result = await deleteWithRetry(id);

          if (result.success) {
            completed++;
          } else {
            failed.push(id);
          }

          // Atualiza progresso após cada item
          const progress = Math.round(
            ((completed + failed.length) / ids.length) * 100
          );
          setState({
            isDeleting: true,
            progress,
            total: ids.length,
            completed,
            failed: [...failed],
            currentBatch: currentBatchNum,
            totalBatches,
          });

          // Pequeno delay entre cada requisição (200ms)
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Delay maior entre lotes
        if (i + batchSize < ids.length) {
          await new Promise(resolve =>
            setTimeout(resolve, delayBetweenBatches)
          );
        }
      }

      // Finaliza
      setState({
        isDeleting: false,
        progress: 100,
        total: ids.length,
        completed,
        failed,
        currentBatch: totalBatches,
        totalBatches,
      });

      if (failed.length > 0 && onError) {
        onError(new Error(`Falha ao excluir ${failed.length} itens`), failed);
      } else if (failed.length === 0 && onSuccess) {
        onSuccess();
      }
    },
    [
      batchSize,
      delayBetweenBatches,
      maxRetries,
      deleteFunction,
      onSuccess,
      onError,
    ]
  );

  const reset = useCallback(() => {
    setState({
      isDeleting: false,
      progress: 0,
      total: 0,
      completed: 0,
      failed: [],
      currentBatch: 0,
      totalBatches: 0,
    });
  }, []);

  return {
    ...state,
    deleteBatch,
    reset,
  };
}
