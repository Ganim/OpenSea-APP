/**
 * Print Queue Context
 * Contexto para gerenciar a fila de impressão de etiquetas
 */

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { nanoid } from 'nanoid';
import { logger } from '@/lib/logger';
import {
  DEFAULT_PAGE_SETTINGS,
  DEFAULT_TEMPLATE_ID,
  MAX_COPIES_PER_ITEM,
  MAX_QUEUE_ITEMS,
  MIN_COPIES,
} from '../constants';
import type {
  AddToQueueInput,
  PageSettings,
  PrintQueueActions,
  PrintQueueContextValue,
  PrintQueueItem,
  PrintQueueState,
} from '../types';
import {
  DEFAULT_PRINT_QUEUE_STATE,
  loadFromStorage,
  saveToStorage,
} from '../utils/storage';

// ============================================
// CONTEXT
// ============================================

const PrintQueueContext = createContext<PrintQueueContextValue | undefined>(
  undefined
);

// ============================================
// PROVIDER
// ============================================

interface PrintQueueProviderProps {
  children: React.ReactNode;
}

export function PrintQueueProvider({ children }: PrintQueueProviderProps) {
  const [state, setState] = useState<PrintQueueState>(() => loadFromStorage());
  const [isHydrated, setIsHydrated] = useState(true);

  // Persistir no localStorage quando o estado mudar
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const itemCount = state.items.length;

  const totalLabels = useMemo(() => {
    return state.items.reduce((sum, item) => sum + item.copies, 0);
  }, [state.items]);

  const hasItems = itemCount > 0;

  // ============================================
  // ACTIONS
  // ============================================

  const addToQueue = useCallback(
    (input: AddToQueueInput | AddToQueueInput[]) => {
      const inputs = Array.isArray(input) ? input : [input];

      setState(prev => {
        // Verificar limite
        if (prev.items.length + inputs.length > MAX_QUEUE_ITEMS) {
          logger.warn(
            `Limite de ${MAX_QUEUE_ITEMS} itens atingido na fila de impressão`
          );
          // Adicionar apenas o que couber
          const available = MAX_QUEUE_ITEMS - prev.items.length;
          inputs.splice(available);
        }

        const newItems: PrintQueueItem[] = [];
        let maxOrder =
          prev.items.length > 0 ? Math.max(...prev.items.map(i => i.order)) : 0;

        for (const inp of inputs) {
          // Verificar se o item já está na fila
          const existing = prev.items.find(qi => qi.item.id === inp.item.id);
          if (existing) {
            // Atualizar cópias ao invés de adicionar duplicata
            logger.debug(`Item ${inp.item.id} já está na fila de impressão`);
            continue;
          }

          const copies = Math.min(
            Math.max(inp.copies ?? 1, MIN_COPIES),
            MAX_COPIES_PER_ITEM
          );

          newItems.push({
            queueId: nanoid(),
            item: inp.item,
            variant: inp.variant,
            product: inp.product,
            copies,
            order: ++maxOrder,
            addedAt: new Date(),
          });
        }

        if (newItems.length === 0) {
          return prev;
        }

        return {
          ...prev,
          items: [...prev.items, ...newItems],
          updatedAt: new Date(),
        };
      });
    },
    []
  );

  const removeFromQueue = useCallback((queueId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.queueId !== queueId),
      updatedAt: new Date(),
    }));
  }, []);

  const updateCopies = useCallback((queueId: string, copies: number) => {
    const validCopies = Math.min(
      Math.max(copies, MIN_COPIES),
      MAX_COPIES_PER_ITEM
    );

    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.queueId === queueId ? { ...item, copies: validCopies } : item
      ),
      updatedAt: new Date(),
    }));
  }, []);

  const reorderQueue = useCallback((queueIds: string[]) => {
    setState(prev => {
      const itemMap = new Map(prev.items.map(item => [item.queueId, item]));
      const reordered = queueIds
        .map((id, index) => {
          const item = itemMap.get(id);
          return item ? { ...item, order: index } : null;
        })
        .filter((item): item is PrintQueueItem => item !== null);

      return {
        ...prev,
        items: reordered,
        updatedAt: new Date(),
      };
    });
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      items: [],
      updatedAt: new Date(),
    }));
  }, []);

  const updatePageSettings = useCallback((settings: Partial<PageSettings>) => {
    setState(prev => ({
      ...prev,
      pageSettings: {
        ...prev.pageSettings,
        ...settings,
        margins: {
          ...prev.pageSettings.margins,
          ...(settings.margins || {}),
        },
        labelSpacing: {
          ...prev.pageSettings.labelSpacing,
          ...(settings.labelSpacing || {}),
        },
      },
      updatedAt: new Date(),
    }));
  }, []);

  const selectTemplate = useCallback((templateId: string) => {
    setState(prev => ({
      ...prev,
      selectedTemplateId: templateId,
      updatedAt: new Date(),
    }));
  }, []);

  const isInQueue = useCallback(
    (itemId: string): boolean => {
      return state.items.some(qi => qi.item.id === itemId);
    },
    [state.items]
  );

  const getQueueItem = useCallback(
    (itemId: string): PrintQueueItem | undefined => {
      return state.items.find(qi => qi.item.id === itemId);
    },
    [state.items]
  );

  // ============================================
  // ACTIONS OBJECT
  // ============================================

  const actions: PrintQueueActions = useMemo(
    () => ({
      addToQueue,
      removeFromQueue,
      updateCopies,
      reorderQueue,
      clearQueue,
      updatePageSettings,
      selectTemplate,
      isInQueue,
      getQueueItem,
    }),
    [
      addToQueue,
      removeFromQueue,
      updateCopies,
      reorderQueue,
      clearQueue,
      updatePageSettings,
      selectTemplate,
      isInQueue,
      getQueueItem,
    ]
  );

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: PrintQueueContextValue = useMemo(
    () => ({
      state,
      itemCount,
      totalLabels,
      hasItems,
      isHydrated,
      actions,
    }),
    [state, itemCount, totalLabels, hasItems, isHydrated, actions]
  );

  return (
    <PrintQueueContext.Provider value={value}>
      {children}
    </PrintQueueContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

/**
 * Hook para acessar o contexto da fila de impressão
 */
export function usePrintQueue(): PrintQueueContextValue {
  const context = useContext(PrintQueueContext);

  if (!context) {
    throw new Error(
      'usePrintQueue deve ser usado dentro de um PrintQueueProvider'
    );
  }

  return context;
}
