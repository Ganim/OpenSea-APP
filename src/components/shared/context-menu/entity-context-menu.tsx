/**
 * Entity Context Menu Component (Generic)
 * Menu de contexto para ações em itens (individuais ou múltiplos)
 * Componente 100% genérico que funciona com qualquer entidade
 */

'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, Eye, Package, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface EntityContextMenuProps {
  children: ReactNode;
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onStockMovement?: () => void;
  onCopyCode?: () => void;
  onDelete?: () => void;
  isMultipleSelection?: boolean;
  selectedCount?: number;
}

export function EntityContextMenu({
  children,
  onView,
  onEdit,
  onDuplicate,
  onStockMovement,
  onCopyCode,
  onDelete,
  isMultipleSelection = false,
  selectedCount = 1,
}: EntityContextMenuProps) {
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
        {onStockMovement && (
          <ContextMenuItem onClick={onStockMovement}>
            <Package className="w-4 h-4" />
            <span>Movimentar Estoque{suffix}</span>
          </ContextMenuItem>
        )}
        {onCopyCode && (
          <ContextMenuItem onClick={onCopyCode}>
            <Copy className="w-4 h-4" />
            <span>Copiar Código{suffix}</span>
          </ContextMenuItem>
        )}
        {(onView || onEdit || onDuplicate || onStockMovement || onCopyCode) &&
          onDelete && <ContextMenuSeparator />}
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
