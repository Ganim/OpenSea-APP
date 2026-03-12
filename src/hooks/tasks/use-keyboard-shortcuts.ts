'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutActions {
  onNewCard?: () => void;
  onEditCard?: () => void;
  onSearch?: () => void;
  onSetPriority?: (level: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
  onAssignLabel?: () => void;
  onAssignMember?: () => void;
  onSetDueDate?: () => void;
  onDuplicateCard?: () => void;
  onArchiveCard?: () => void;
  onShowHelp?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
  onOpenCard?: () => void;
}

function isTypingElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toUpperCase();
  if (tagName === 'INPUT' || tagName === 'TEXTAREA') return true;
  if (target.isContentEditable) return true;

  return false;
}

const PRIORITY_MAP: Record<string, 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'> = {
  '1': 'URGENT',
  '2': 'HIGH',
  '3': 'MEDIUM',
  '4': 'LOW',
};

export function useKeyboardShortcuts(actions: KeyboardShortcutActions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isTypingElement(event.target)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const key = event.key;

      switch (key) {
        case 'n':
        case 'N':
          actions.onNewCard?.();
          break;

        case 'e':
        case 'E':
          actions.onEditCard?.();
          break;

        case '/':
          event.preventDefault();
          actions.onSearch?.();
          break;

        case '1':
        case '2':
        case '3':
        case '4':
          actions.onSetPriority?.(PRIORITY_MAP[key]);
          break;

        case 'l':
        case 'L':
          actions.onAssignLabel?.();
          break;

        case 'm':
        case 'M':
          actions.onAssignMember?.();
          break;

        case 'p':
        case 'P':
          actions.onSetDueDate?.();
          break;

        case 'd':
        case 'D':
          actions.onDuplicateCard?.();
          break;

        case 'Delete':
          actions.onArchiveCard?.();
          break;

        case '?':
          actions.onShowHelp?.();
          break;

        case 'ArrowUp':
          event.preventDefault();
          actions.onNavigateUp?.();
          break;

        case 'ArrowDown':
          event.preventDefault();
          actions.onNavigateDown?.();
          break;

        case 'ArrowLeft':
          event.preventDefault();
          actions.onNavigateLeft?.();
          break;

        case 'ArrowRight':
          event.preventDefault();
          actions.onNavigateRight?.();
          break;

        case 'Enter':
          actions.onOpenCard?.();
          break;

        default:
          break;
      }
    },
    [actions]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
