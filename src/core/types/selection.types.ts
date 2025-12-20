/**
 * OpenSea OS - Selection Types
 * Tipos para sistema de seleção
 */

import { ComponentType, ReactNode } from 'react';

// =============================================================================
// SELECTION STATE
// =============================================================================

/**
 * Estado da seleção
 */
export interface SelectionState<T = string> {
  /** IDs selecionados */
  selectedIds: Set<T>;
  /** Todos selecionados */
  isAllSelected: boolean;
  /** Parcialmente selecionados (indeterminate) */
  isIndeterminate: boolean;
  /** Número de itens selecionados */
  count: number;
  /** Último item selecionado (para shift+click) */
  lastSelectedId: T | null;
  /** Modo de seleção ativo */
  isSelectionMode: boolean;
}

// =============================================================================
// SELECTION ACTIONS
// =============================================================================

/**
 * Ações de seleção
 */
export interface SelectionActions<T = string> {
  /** Selecionar apenas este item (limpa outros) - comportamento Windows Explorer */
  select: (id: T) => void;
  /** Adicionar à seleção existente (Ctrl+Click) */
  addToSelection: (id: T) => void;
  /** Deselecionar um item */
  deselect: (id: T) => void;
  /** Toggle seleção de um item */
  toggle: (id: T) => void;
  /** Selecionar todos */
  selectAll: () => void;
  /** Deselecionar todos */
  deselectAll: () => void;
  /** Toggle selecionar todos */
  toggleAll: () => void;
  /** Selecionar múltiplos */
  selectMultiple: (ids: T[]) => void;
  /** Deselecionar múltiplos */
  deselectMultiple: (ids: T[]) => void;
  /** Selecionar range (shift+click) */
  selectRange: (fromId: T, toId: T) => void;
  /** Verificar se está selecionado */
  isSelected: (id: T) => boolean;
  /** Limpar seleção */
  clear: () => void;
  /** Entrar em modo seleção */
  enterSelectionMode: () => void;
  /** Sair do modo seleção */
  exitSelectionMode: () => void;
}

// =============================================================================
// SELECTION CONTEXT
// =============================================================================

/**
 * Contexto completo de seleção
 */
export interface SelectionContextValue<T = string> {
  state: SelectionState<T>;
  actions: SelectionActions<T>;
  /** IDs disponíveis para seleção */
  availableIds: T[];
  /** Definir IDs disponíveis */
  setAvailableIds: (ids: T[]) => void;
  /** Obter array de IDs selecionados */
  getSelectedArray: () => T[];
}

// =============================================================================
// SELECTION TOOLBAR
// =============================================================================

/**
 * Ação da toolbar de seleção
 */
export interface SelectionToolbarAction<T = unknown> {
  /** ID único da ação */
  id: string;
  /** Label da ação */
  label: string;
  /** Ícone da ação */
  icon?: ComponentType<{ className?: string }>;
  /** Variante do botão */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Handler da ação */
  onClick: (selectedIds: string[], items?: T[]) => void | Promise<void>;
  /** Ação desabilitada */
  disabled?: boolean | ((selectedIds: string[]) => boolean);
  /** Loading state */
  loading?: boolean;
  /** Permissão necessária */
  permission?: string;
  /** Número mínimo de seleção */
  minSelection?: number;
  /** Número máximo de seleção */
  maxSelection?: number;
  /** Separador antes da ação */
  separator?: boolean;
  /** Confirmar antes de executar */
  confirm?: boolean;
  /** Mensagem de confirmação */
  confirmTitle?: string;
  confirmMessage?: string;
  /** Atalho de teclado */
  shortcut?: string;
}

/**
 * Configuração da toolbar de seleção
 */
export interface SelectionToolbarConfig<T = unknown> {
  /** Posição da toolbar */
  position?: 'top' | 'bottom' | 'floating';
  /** Ações disponíveis */
  actions: SelectionToolbarAction<T>[];
  /** Mostrar contador */
  showCount?: boolean;
  /** Mostrar botão de limpar seleção */
  showClear?: boolean;
  /** Mostrar botão de selecionar todos */
  showSelectAll?: boolean;
  /** Custom render */
  render?: (props: SelectionToolbarRenderProps<T>) => ReactNode;
}

/**
 * Props para render customizado da toolbar
 */
export interface SelectionToolbarRenderProps<T = unknown> {
  selectedIds: string[];
  count: number;
  isAllSelected: boolean;
  actions: SelectionToolbarAction<T>[];
  onClear: () => void;
  onSelectAll: () => void;
}

// =============================================================================
// SELECTION PROVIDER PROPS
// =============================================================================

/**
 * Props do SelectionProvider
 */
export interface SelectionProviderProps {
  /** Namespace para evitar conflitos entre múltiplas listas */
  namespace?: string;
  /** IDs disponíveis para seleção */
  initialIds?: string[];
  /** Limite máximo de seleção */
  maxSelection?: number;
  /** Callback quando seleção muda */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Children */
  children: ReactNode;
}

// =============================================================================
// SELECTION CHECKBOX PROPS
// =============================================================================

/**
 * Props do checkbox de seleção
 */
export interface SelectionCheckboxProps {
  /** ID do item */
  id: string;
  /** Desabilitado */
  disabled?: boolean;
  /** Classe customizada */
  className?: string;
  /** Callback ao mudar */
  onChange?: (checked: boolean) => void;
}

/**
 * Props do checkbox "selecionar todos"
 */
export interface SelectAllCheckboxProps {
  /** Desabilitado */
  disabled?: boolean;
  /** Classe customizada */
  className?: string;
}
