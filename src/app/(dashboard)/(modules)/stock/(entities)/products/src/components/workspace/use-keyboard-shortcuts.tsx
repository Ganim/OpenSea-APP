'use client';

/**
 * useKeyboardShortcuts Hook
 * Keyboard shortcuts for the product workspace
 */

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onQuickAdd?: () => void;
  onNewVariant?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onQuickAdd,
  onNewVariant,
  onSearch,
  onEscape,
  onDelete,
  onEdit,
  onDuplicate,
  enabled = true,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Escape always works
      if (event.key === 'Escape') {
        onEscape?.();
        return;
      }

      // Other shortcuts only work when not in input
      if (isInput) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl/Cmd + N: Quick Add
      if (cmdOrCtrl && event.key === 'n' && !event.shiftKey) {
        event.preventDefault();
        onQuickAdd?.();
        return;
      }

      // Ctrl/Cmd + Shift + N: New Variant
      if (cmdOrCtrl && event.key === 'N' && event.shiftKey) {
        event.preventDefault();
        onNewVariant?.();
        return;
      }

      // Ctrl/Cmd + E: Edit
      if (cmdOrCtrl && event.key === 'e') {
        event.preventDefault();
        onEdit?.();
        return;
      }

      // Ctrl/Cmd + D: Duplicate
      if (cmdOrCtrl && event.key === 'd') {
        event.preventDefault();
        onDuplicate?.();
        return;
      }

      // / : Focus search
      if (event.key === '/') {
        event.preventDefault();
        onSearch?.();
        return;
      }

      // Delete: Delete selected
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Only if not in input
        onDelete?.();
        return;
      }
    },
    [
      enabled,
      onQuickAdd,
      onNewVariant,
      onSearch,
      onEscape,
      onDelete,
      onEdit,
      onDuplicate,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Shortcut hints component
interface ShortcutHintProps {
  shortcut: string;
  className?: string;
}

export function ShortcutHint({ shortcut, className }: ShortcutHintProps) {
  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const formatShortcut = (s: string) => {
    return s
      .replace('Ctrl', isMac ? '⌘' : 'Ctrl')
      .replace('Shift', isMac ? '⇧' : 'Shift')
      .replace('Alt', isMac ? '⌥' : 'Alt');
  };

  return (
    <kbd
      className={`px-1.5 py-0.5 text-xs bg-muted rounded border ${className}`}
    >
      {formatShortcut(shortcut)}
    </kbd>
  );
}

// Shortcuts reference
export const SHORTCUTS = {
  QUICK_ADD: 'Ctrl+N',
  NEW_VARIANT: 'Ctrl+Shift+N',
  SEARCH: '/',
  EDIT: 'Ctrl+E',
  DUPLICATE: 'Ctrl+D',
  DELETE: 'Delete',
  ESCAPE: 'Esc',
} as const;
