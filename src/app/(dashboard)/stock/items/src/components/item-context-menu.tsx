/**
 * Item Context Menu Component
 * Menu de contexto para ações em itens (individuais ou múltiplos)
 */

'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, Eye, Pencil, Printer, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface ItemContextMenuProps {
  children: ReactNode;
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onPrint?: () => void;
  onDelete?: () => void;
  isMultipleSelection?: boolean;
  selectedCount?: number;
}

export function ItemContextMenu({
  children,
  onView,
  onEdit,
  onDuplicate,
  onPrint,
  onDelete,
  isMultipleSelection = false,
  selectedCount = 1,
}: ItemContextMenuProps) {
  const suffix =
    isMultipleSelection && selectedCount > 1 ? ` (${selectedCount})` : '';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {onView && (
          <ContextMenuItem onClick={onView}>
            <Eye className="w-4 h-4" />
            <span>Visualizar{suffix}</span>
          </ContextMenuItem>
        )}
        {onEdit && (
          <ContextMenuItem onClick={onEdit}>
            <Pencil className="w-4 h-4" />
            <span>Editar{suffix}</span>
          </ContextMenuItem>
        )}
        {onDuplicate && (
          <ContextMenuItem onClick={onDuplicate}>
            <Copy className="w-4 h-4" />
            <span>Duplicar{suffix}</span>
          </ContextMenuItem>
        )}
        {onPrint && (
          <ContextMenuItem onClick={onPrint}>
            <Printer className="w-4 h-4" />
            <span>Imprimir Etiqueta{suffix}</span>
          </ContextMenuItem>
        )}
        {(onView || onEdit || onDuplicate || onPrint) && onDelete && (
          <ContextMenuSeparator />
        )}
        {onDelete && (
          <ContextMenuItem onClick={onDelete} variant="destructive">
            <Trash2 className="w-4 h-4" />
            <span>Excluir{suffix}</span>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
