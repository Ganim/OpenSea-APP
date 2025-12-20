/**
 * OpenSea OS - Selection Context & Provider
 * Provê contexto de seleção para componentes filhos
 */

'use client';

import type {
    SelectionContextValue,
    SelectionProviderProps,
} from '@/core/types';
import React, { createContext, useContext, useEffect } from 'react';
import { useSelection, type UseSelectionOptions } from './hooks/use-selection';

// =============================================================================
// CONTEXT
// =============================================================================

const SelectionContext = createContext<SelectionContextValue<string> | null>(
  null
);

// =============================================================================
// PROVIDER
// =============================================================================

export interface SelectionProviderComponentProps
  extends Omit<SelectionProviderProps, 'children'>,
    Pick<UseSelectionOptions, 'maxSelection' | 'onSelectionChange'> {
  children: React.ReactNode;
  /** Se true, clicar fora dos itens selecionáveis limpa a seleção */
  clearOnClickOutside?: boolean;
}

export function SelectionProvider({
  namespace: _namespace,
  initialIds = [],
  maxSelection,
  onSelectionChange,
  clearOnClickOutside = true,
  children,
}: SelectionProviderComponentProps) {
  const selection = useSelection({
    initialIds,
    maxSelection,
    onSelectionChange,
  });

  // Atualizar IDs disponíveis quando o array de IDs realmente mudar
  // Usando JSON.stringify para comparação profunda evita loops infinitos
  const idsKey = React.useMemo(() => JSON.stringify(initialIds), [initialIds]);

  useEffect(() => {
    selection.setAvailableIds(initialIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  // Click outside listener para limpar seleção
  useEffect(() => {
    if (!clearOnClickOutside) return;

    // Track mousedown position to detect drag
    let mouseDownPos: { x: number; y: number } | null = null;
    const DRAG_THRESHOLD = 5;

    const handleMouseDown = (e: MouseEvent) => {
      mouseDownPos = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if this was a drag (moved more than threshold)
      if (mouseDownPos) {
        const deltaX = Math.abs(e.clientX - mouseDownPos.x);
        const deltaY = Math.abs(e.clientY - mouseDownPos.y);
        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          // This was a drag, not a click - don't clear selection
          mouseDownPos = null;
          return;
        }
      }
      mouseDownPos = null;
      
      // Ignorar se clicou em um card, menu, toolbar de seleção ou popup
      const interactiveSelectors = [
        '[data-item-card]',           // Cards de entidade
        '[data-radix-menu-content]',  // Context menu
        '[data-selection-toolbar]',   // Toolbar de seleção
        '[role="dialog"]',            // Modais
        '[data-radix-popper-content-wrapper]', // Poppers do Radix
        '[data-entity-grid]',         // Container do grid (para drag selection)
        'button',                     // Botões
        'a',                          // Links
        'input',                      // Inputs
        'select',                     // Selects
        'textarea',                   // Textareas
      ];
      
      const clickedOnInteractive = interactiveSelectors.some(selector => 
        target.closest(selector)
      );
      
      if (clickedOnInteractive) return;
      
      // Limpa a seleção se clicou fora
      if (selection.state.selectedIds.size > 0) {
        selection.actions.clear();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('click', handleClick);
    };
  }, [clearOnClickOutside, selection]);

  return (
    <SelectionContext.Provider value={selection}>
      {children}
    </SelectionContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useSelectionContext(): SelectionContextValue<string> {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error(
      'useSelectionContext deve ser usado dentro de um SelectionProvider'
    );
  }

  return context;
}

// =============================================================================
// OPTIONAL HOOK (não lança erro se não tiver provider)
// =============================================================================

export function useOptionalSelectionContext(): SelectionContextValue<string> | null {
  return useContext(SelectionContext);
}

// =============================================================================
// SELECTION CHECKBOX COMPONENT
// =============================================================================

export interface SelectionCheckboxProps {
  id: string;
  disabled?: boolean;
  className?: string;
}

export function SelectionCheckbox({
  id,
  disabled = false,
  className = '',
}: SelectionCheckboxProps) {
  const { state, actions } = useSelectionContext();
  const isChecked = actions.isSelected(id);

  return (
    <input
      type="checkbox"
      checked={isChecked}
      disabled={disabled}
      onChange={() => actions.toggle(id)}
      onClick={e => e.stopPropagation()}
      className={`h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 ${className}`}
    />
  );
}

// =============================================================================
// SELECT ALL CHECKBOX COMPONENT
// =============================================================================

export interface SelectAllCheckboxProps {
  disabled?: boolean;
  className?: string;
}

export function SelectAllCheckbox({
  disabled = false,
  className = '',
}: SelectAllCheckboxProps) {
  const { state, actions } = useSelectionContext();

  return (
    <input
      type="checkbox"
      checked={state.isAllSelected}
      disabled={disabled}
      ref={el => {
        if (el) {
          el.indeterminate = state.isIndeterminate;
        }
      }}
      onChange={() => actions.toggleAll()}
      onClick={e => e.stopPropagation()}
      className={`h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 ${className}`}
    />
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { SelectionContext };

