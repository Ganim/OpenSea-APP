/**
 * OpenSea OS - useSelection Hook
 * Hook para gerenciar estado de seleção
 */

import type {
  SelectionActions,
  SelectionContextValue,
  SelectionState,
} from '@/core/types';
import { useCallback, useMemo, useState } from 'react';

export interface UseSelectionOptions {
  /** IDs inicialmente disponíveis */
  initialIds?: string[];
  /** IDs inicialmente selecionados */
  initialSelected?: string[];
  /** Limite máximo de seleção */
  maxSelection?: number;
  /** Callback quando seleção muda */
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function useSelection(
  options: UseSelectionOptions = {}
): SelectionContextValue<string> {
  const {
    initialIds = [],
    initialSelected = [],
    maxSelection,
    onSelectionChange,
  } = options;

  // Estado de IDs disponíveis
  const [availableIds, setAvailableIds] = useState<string[]>(initialIds);

  // Estado de IDs selecionados (usando Set para performance)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialSelected)
  );

  // Último ID selecionado (para range selection)
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // Modo de seleção ativo
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(
    initialSelected.length > 0
  );

  // Helper para notificar mudanças
  const notifyChange = useCallback(
    (newSelected: Set<string>) => {
      onSelectionChange?.(Array.from(newSelected));
    },
    [onSelectionChange]
  );

  // Helper para verificar se pode adicionar mais seleções
  const canAddSelection = useCallback(
    (currentCount: number, addCount: number = 1): boolean => {
      if (!maxSelection) return true;
      return currentCount + addCount <= maxSelection;
    },
    [maxSelection]
  );

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  // Seleciona apenas este item (limpa outros) - comportamento Windows Explorer
  const select = useCallback(
    (id: string) => {
      setSelectedIds(prev => {
        // Se já é o único selecionado, não faz nada
        if (prev.size === 1 && prev.has(id)) return prev;

        // Limpa tudo e seleciona apenas este item
        const next = new Set<string>([id]);
        setLastSelectedId(id);
        setIsSelectionMode(true);
        notifyChange(next);
        return next;
      });
    },
    [notifyChange]
  );

  // Adiciona à seleção existente (Ctrl+Click)
  const addToSelection = useCallback(
    (id: string) => {
      setSelectedIds(prev => {
        if (prev.has(id)) return prev;
        if (!canAddSelection(prev.size)) return prev;

        const next = new Set(prev);
        next.add(id);
        setLastSelectedId(id);
        setIsSelectionMode(true);
        notifyChange(next);
        return next;
      });
    },
    [canAddSelection, notifyChange]
  );

  const deselect = useCallback(
    (id: string) => {
      setSelectedIds(prev => {
        if (!prev.has(id)) return prev;

        const next = new Set(prev);
        next.delete(id);

        // Sair do modo seleção se não houver mais selecionados
        if (next.size === 0) {
          setIsSelectionMode(false);
        }

        notifyChange(next);
        return next;
      });
    },
    [notifyChange]
  );

  const toggle = useCallback(
    (id: string) => {
      setSelectedIds(prev => {
        const next = new Set(prev);

        if (prev.has(id)) {
          next.delete(id);
          if (next.size === 0) {
            setIsSelectionMode(false);
          }
        } else {
          if (!canAddSelection(prev.size)) return prev;
          next.add(id);
          setLastSelectedId(id);
          setIsSelectionMode(true);
        }

        notifyChange(next);
        return next;
      });
    },
    [canAddSelection, notifyChange]
  );

  const selectAll = useCallback(() => {
    const idsToSelect = maxSelection
      ? availableIds.slice(0, maxSelection)
      : availableIds;

    setSelectedIds(() => {
      const next = new Set(idsToSelect);
      setIsSelectionMode(true);
      notifyChange(next);
      return next;
    });
  }, [availableIds, maxSelection, notifyChange]);

  const deselectAll = useCallback(() => {
    setSelectedIds(() => {
      const next = new Set<string>();
      setIsSelectionMode(false);
      setLastSelectedId(null);
      notifyChange(next);
      return next;
    });
  }, [notifyChange]);

  const toggleAll = useCallback(() => {
    setSelectedIds(prev => {
      const allSelected = availableIds.every(id => prev.has(id));

      if (allSelected) {
        const next = new Set<string>();
        setIsSelectionMode(false);
        setLastSelectedId(null);
        notifyChange(next);
        return next;
      } else {
        const idsToSelect = maxSelection
          ? availableIds.slice(0, maxSelection)
          : availableIds;
        const next = new Set(idsToSelect);
        setIsSelectionMode(true);
        notifyChange(next);
        return next;
      }
    });
  }, [availableIds, maxSelection, notifyChange]);

  const selectMultiple = useCallback(
    (ids: string[]) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        let added = 0;

        for (const id of ids) {
          if (!next.has(id)) {
            if (maxSelection && next.size >= maxSelection) break;
            next.add(id);
            added++;
          }
        }

        if (added > 0) {
          setIsSelectionMode(true);
          setLastSelectedId(ids[ids.length - 1]);
          notifyChange(next);
        }

        return next;
      });
    },
    [maxSelection, notifyChange]
  );

  const deselectMultiple = useCallback(
    (ids: string[]) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        let removed = 0;

        for (const id of ids) {
          if (next.has(id)) {
            next.delete(id);
            removed++;
          }
        }

        if (removed > 0) {
          if (next.size === 0) {
            setIsSelectionMode(false);
          }
          notifyChange(next);
        }

        return next;
      });
    },
    [notifyChange]
  );

  const selectRange = useCallback(
    (fromId: string, toId: string) => {
      const fromIndex = availableIds.indexOf(fromId);
      const toIndex = availableIds.indexOf(toId);

      if (fromIndex === -1 || toIndex === -1) return;

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);

      const rangeIds = availableIds.slice(start, end + 1);
      selectMultiple(rangeIds);
    },
    [availableIds, selectMultiple]
  );

  const isSelected = useCallback(
    (id: string): boolean => selectedIds.has(id),
    [selectedIds]
  );

  const clear = useCallback(() => {
    deselectAll();
  }, [deselectAll]);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    deselectAll();
  }, [deselectAll]);

  const getSelectedArray = useCallback((): string[] => {
    return Array.from(selectedIds);
  }, [selectedIds]);

  // ==========================================================================
  // COMPUTED STATE
  // ==========================================================================

  const state = useMemo<SelectionState<string>>(() => {
    const count = selectedIds.size;
    const availableCount = availableIds.length;
    const isAllSelected = availableCount > 0 && count === availableCount;
    const isIndeterminate = count > 0 && count < availableCount;

    return {
      selectedIds,
      isAllSelected,
      isIndeterminate,
      count,
      lastSelectedId,
      isSelectionMode,
    };
  }, [selectedIds, availableIds, lastSelectedId, isSelectionMode]);

  const actions = useMemo<SelectionActions<string>>(
    () => ({
      select,
      addToSelection,
      deselect,
      toggle,
      selectAll,
      deselectAll,
      toggleAll,
      selectMultiple,
      deselectMultiple,
      selectRange,
      isSelected,
      clear,
      enterSelectionMode,
      exitSelectionMode,
    }),
    [
      select,
      addToSelection,
      deselect,
      toggle,
      selectAll,
      deselectAll,
      toggleAll,
      selectMultiple,
      deselectMultiple,
      selectRange,
      isSelected,
      clear,
      enterSelectionMode,
      exitSelectionMode,
    ]
  );

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    state,
    actions,
    availableIds,
    setAvailableIds,
    getSelectedArray,
  };
}

export default useSelection;
