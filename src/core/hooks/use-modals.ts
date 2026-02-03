/**
 * OpenSea OS - useModals Hook
 * Hook para gerenciar estado de modais em páginas de entidade
 */

import { useCallback, useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type ModalType =
  | 'create'
  | 'edit'
  | 'view'
  | 'delete'
  | 'duplicate'
  | 'import'
  | 'export'
  | 'multiView'
  | 'bulkEdit'
  | 'help'
  | 'settings';

export interface UseModalsOptions {
  /** IDs de modais inicialmente abertos */
  initialOpen?: ModalType[];
}

export interface UseModalsReturn<T = unknown> {
  /** Verificar se um modal está aberto */
  isOpen: (modal: ModalType) => boolean;
  /** Abrir um modal */
  open: (modal: ModalType) => void;
  /** Fechar um modal */
  close: (modal: ModalType) => void;
  /** Alternar um modal */
  toggle: (modal: ModalType) => void;
  /** Fechar todos os modais */
  closeAll: () => void;

  // Estados específicos para modais
  /** Item sendo editado */
  editingItem: T | null;
  /** Definir item sendo editado */
  setEditingItem: (item: T | null) => void;

  /** Item sendo visualizado */
  viewingItem: T | null;
  /** Definir item sendo visualizado */
  setViewingItem: (item: T | null) => void;

  /** IDs dos itens a serem deletados */
  itemsToDelete: string[];
  /** Definir IDs dos itens a serem deletados */
  setItemsToDelete: (ids: string[]) => void;

  /** IDs dos itens a serem duplicados */
  itemsToDuplicate: string[];
  /** Definir IDs dos itens a serem duplicados */
  setItemsToDuplicate: (ids: string[]) => void;

  /** IDs dos itens a serem visualizados em massa */
  itemsToView: string[];
  /** Definir IDs dos itens a serem visualizados em massa */
  setItemsToView: (ids: string[]) => void;

  /** IDs dos itens a serem editados em massa */
  itemsToEdit: string[];
  /** Definir IDs dos itens a serem editados em massa */
  setItemsToEdit: (ids: string[]) => void;

  /** Dados para importação */
  importData: unknown | null;
  /** Definir dados para importação */
  setImportData: (data: unknown | null) => void;

  /** Configuração de exportação */
  exportConfig: ExportConfig | null;
  /** Definir configuração de exportação */
  setExportConfig: (config: ExportConfig | null) => void;
}

export interface ExportConfig {
  format?: 'csv' | 'xlsx' | 'json' | 'pdf';
  fields?: string[];
  filename?: string;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook para gerenciar estado de modais
 *
 * @example
 * ```tsx
 * const modals = useModals();
 *
 * // Abrir modal de criação
 * modals.open('create');
 *
 * // Abrir modal de edição com item
 * modals.setEditingItem(item);
 * modals.open('edit');
 *
 * // Abrir modal de deleção com IDs
 * modals.setItemsToDelete(['id1', 'id2']);
 * modals.open('delete');
 *
 * // Verificar se modal está aberto
 * if (modals.isOpen('create')) {
 *   // ...
 * }
 *
 * // Fechar todos os modais
 * modals.closeAll();
 * ```
 */
export function useModals<T = unknown>(
  options: UseModalsOptions = {}
): UseModalsReturn<T> {
  const { initialOpen = [] } = options;

  // Estado de modais abertos
  const [openModals, setOpenModals] = useState<Set<ModalType>>(
    new Set(initialOpen)
  );

  // Estados específicos
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [viewingItem, setViewingItem] = useState<T | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [itemsToDuplicate, setItemsToDuplicate] = useState<string[]>([]);
  const [itemsToView, setItemsToView] = useState<string[]>([]);
  const [itemsToEdit, setItemsToEdit] = useState<string[]>([]);
  const [importData, setImportData] = useState<unknown | null>(null);
  const [exportConfig, setExportConfig] = useState<ExportConfig | null>(null);

  // Verificar se modal está aberto
  const isOpen = useCallback(
    (modal: ModalType): boolean => {
      return openModals.has(modal);
    },
    [openModals]
  );

  // Abrir modal
  const open = useCallback((modal: ModalType) => {
    setOpenModals(prev => new Set(prev).add(modal));
  }, []);

  // Fechar modal
  const close = useCallback((modal: ModalType) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.delete(modal);
      return next;
    });

    // Limpar estados específicos quando fechar modais
    if (modal === 'edit') {
      setEditingItem(null);
    } else if (modal === 'view') {
      setViewingItem(null);
    } else if (modal === 'delete') {
      setItemsToDelete([]);
    } else if (modal === 'duplicate') {
      setItemsToDuplicate([]);
    } else if (modal === 'multiView') {
      setItemsToView([]);
    } else if (modal === 'bulkEdit') {
      setItemsToEdit([]);
    } else if (modal === 'import') {
      setImportData(null);
    } else if (modal === 'export') {
      setExportConfig(null);
    }
  }, []);

  // Alternar modal
  const toggle = useCallback(
    (modal: ModalType) => {
      if (isOpen(modal)) {
        close(modal);
      } else {
        open(modal);
      }
    },
    [isOpen, open, close]
  );

  // Fechar todos os modais
  const closeAll = useCallback(() => {
    setOpenModals(new Set());
    // Limpar todos os estados
    setEditingItem(null);
    setViewingItem(null);
    setItemsToDelete([]);
    setItemsToDuplicate([]);
    setItemsToView([]);
    setItemsToEdit([]);
    setImportData(null);
    setExportConfig(null);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    closeAll,
    editingItem,
    setEditingItem,
    viewingItem,
    setViewingItem,
    itemsToDelete,
    setItemsToDelete,
    itemsToDuplicate,
    setItemsToDuplicate,
    itemsToView,
    setItemsToView,
    itemsToEdit,
    setItemsToEdit,
    importData,
    setImportData,
    exportConfig,
    setExportConfig,
  };
}

export default useModals;
