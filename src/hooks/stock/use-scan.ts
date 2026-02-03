import { scanService } from '@/services/stock';
import type { ScanRequest, BatchScanRequest } from '@/types/stock';
import { useMutation } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

// POST /v1/scan - Escaneia um código
export function useScan() {
  return useMutation({
    mutationFn: (data: ScanRequest) => scanService.scan(data),
  });
}

// POST /v1/scan/batch - Escaneia múltiplos códigos
export function useBatchScan() {
  return useMutation({
    mutationFn: (data: BatchScanRequest) => scanService.scanBatch(data),
  });
}

// Convenience hooks for specific contexts
export function useQuickScan() {
  return useMutation({
    mutationFn: (code: string) => scanService.quickScan(code),
  });
}

export function useScanForEntry() {
  return useMutation({
    mutationFn: (code: string) => scanService.scanForEntry(code),
  });
}

export function useScanForExit() {
  return useMutation({
    mutationFn: (code: string) => scanService.scanForExit(code),
  });
}

export function useScanForTransfer() {
  return useMutation({
    mutationFn: (code: string) => scanService.scanForTransfer(code),
  });
}

export function useScanForInventory() {
  return useMutation({
    mutationFn: (code: string) => scanService.scanForInventory(code),
  });
}

// Hook for managing scan mode with state
export function useScanMode(initialContext: ScanRequest['context'] = 'INFO') {
  const [context, setContext] =
    useState<ScanRequest['context']>(initialContext);
  const [lastResult, setLastResult] = useState<Awaited<
    ReturnType<typeof scanService.scan>
  > | null>(null);
  const [history, setHistory] = useState<
    Array<{
      code: string;
      result: Awaited<ReturnType<typeof scanService.scan>>;
      timestamp: Date;
    }>
  >([]);

  const scanMutation = useMutation({
    mutationFn: (code: string) => scanService.scan({ code, context }),
    onSuccess: (result, code) => {
      setLastResult(result);
      setHistory(prev => [...prev, { code, result, timestamp: new Date() }]);
    },
  });

  const scan = useCallback(
    (code: string) => {
      return scanMutation.mutateAsync(code);
    },
    [scanMutation]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    setLastResult(null);
  }, []);

  const changeContext = useCallback(
    (newContext: ScanRequest['context']) => {
      setContext(newContext);
      clearHistory();
    },
    [clearHistory]
  );

  return {
    scan,
    context,
    setContext: changeContext,
    lastResult,
    history,
    clearHistory,
    isScanning: scanMutation.isPending,
    error: scanMutation.error,
  };
}

// Hook for continuous scanning (e.g., with a barcode scanner)
export function useContinuousScan(
  context: ScanRequest['context'] = 'INFO',
  onScan?: (result: Awaited<ReturnType<typeof scanService.scan>>) => void
) {
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [results, setResults] = useState<
    Map<string, Awaited<ReturnType<typeof scanService.scan>>>
  >(new Map());

  const scanMutation = useMutation({
    mutationFn: (code: string) => scanService.scan({ code, context }),
    onSuccess: (result, code) => {
      setResults(prev => new Map(prev).set(code, result));
      onScan?.(result);
    },
  });

  const scan = useCallback(
    (code: string) => {
      if (!scannedCodes.includes(code)) {
        setScannedCodes(prev => [...prev, code]);
        return scanMutation.mutateAsync(code);
      }
      // Return existing result if already scanned
      return Promise.resolve(results.get(code)!);
    },
    [scannedCodes, results, scanMutation]
  );

  const reset = useCallback(() => {
    setScannedCodes([]);
    setResults(new Map());
  }, []);

  const remove = useCallback((code: string) => {
    setScannedCodes(prev => prev.filter(c => c !== code));
    setResults(prev => {
      const newMap = new Map(prev);
      newMap.delete(code);
      return newMap;
    });
  }, []);

  return {
    scan,
    scannedCodes,
    results,
    reset,
    remove,
    isScanning: scanMutation.isPending,
    error: scanMutation.error,
  };
}
