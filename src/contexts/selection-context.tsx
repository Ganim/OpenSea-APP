/**
 * Selection Context
 * Gerencia seleção múltipla de itens com suporte a:
 * - Click simples: seleciona um item
 * - Ctrl+Click: adiciona/remove da seleção
 * - Shift+Click: seleção em massa
 * - Drag Selection: arrastar para selecionar múltiplos
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface SelectionContextData {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
  isSelecting: boolean;
  selectItem: (id: string, event?: React.MouseEvent) => void;
  toggleSelection: (id: string) => void;
  selectRange: (startId: string, endId: string, allIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  selectMultiple: (ids: string[]) => void;
  startDragSelection: () => void;
  endDragSelection: () => void;
  addToDragSelection: (id: string) => void;
}

const SelectionContext = createContext<SelectionContextData | undefined>(
  undefined
);

interface SelectionProviderProps {
  children: ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const dragSelectionIds = useRef<Set<string>>(new Set());

  const selectItem = useCallback(
    (id: string, event?: React.MouseEvent) => {
      if (!event) {
        // Seleção simples sem modificadores
        setSelectedIds(new Set([id]));
        setLastSelectedId(id);
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        // Ctrl+Click: toggle na seleção
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
          return newSet;
        });
        setLastSelectedId(id);
      } else if (event.shiftKey && lastSelectedId) {
        // Shift+Click: seleção em range (será tratada pela página que tem acesso a allIds)
        // Esta função será chamada pela página
        setLastSelectedId(id);
      } else {
        // Click simples: se já está selecionado, remove a seleção; senão seleciona apenas este item
        setSelectedIds(prev => {
          if (prev.has(id) && prev.size === 1) {
            return new Set();
          }
          return new Set([id]);
        });
        setLastSelectedId(id);
      }
    },
    [lastSelectedId]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectRange = useCallback(
    (startId: string, endId: string, allIds: string[]) => {
      const startIndex = allIds.indexOf(startId);
      const endIndex = allIds.indexOf(endId);

      if (startIndex === -1 || endIndex === -1) return;

      const rangeStart = Math.min(startIndex, endIndex);
      const rangeEnd = Math.max(startIndex, endIndex);

      const idsInRange = allIds.slice(rangeStart, rangeEnd + 1);
      setSelectedIds(new Set(idsInRange));
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const startDragSelection = useCallback(() => {
    setIsSelecting(true);
    dragSelectionIds.current = new Set();
  }, []);

  const endDragSelection = useCallback(() => {
    setIsSelecting(false);
    if (dragSelectionIds.current.size > 0) {
      setSelectedIds(new Set(dragSelectionIds.current));
    }
    dragSelectionIds.current = new Set();
  }, []);

  const addToDragSelection = useCallback(
    (id: string) => {
      if (isSelecting) {
        dragSelectionIds.current.add(id);
        setSelectedIds(new Set(dragSelectionIds.current));
      }
    },
    [isSelecting]
  );

  return (
    <SelectionContext.Provider
      value={{
        selectedIds,
        lastSelectedId,
        isSelecting,
        selectItem,
        toggleSelection,
        selectRange,
        clearSelection,
        isSelected,
        selectMultiple,
        startDragSelection,
        endDragSelection,
        addToDragSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection deve ser usado dentro de SelectionProvider');
  }
  return context;
}
