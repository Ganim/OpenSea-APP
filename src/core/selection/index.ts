/**
 * OpenSea OS - Selection Module Index
 * Exporta todos os componentes e hooks de seleção
 */

// Hooks
export { useSelection, type UseSelectionOptions } from './hooks/use-selection';

// Context & Provider
export {
  SelectionProvider,
  SelectionContext,
  useSelectionContext,
  useOptionalSelectionContext,
  SelectionCheckbox,
  SelectAllCheckbox,
  type SelectionProviderComponentProps,
  type SelectionCheckboxProps,
  type SelectAllCheckboxProps,
} from './selection-context';
