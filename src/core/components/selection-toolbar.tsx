/**
 * OpenSea OS - SelectionToolbar Component
 * Barra de ferramentas flutuante para operações em lote
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Copy,
  Download,
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  X,
} from 'lucide-react';
import React from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface SelectionAction {
  /** ID único da ação */
  id: string;
  /** Label da ação */
  label: string;
  /** Ícone da ação */
  icon: React.ComponentType<{ className?: string }>;
  /** Handler da ação */
  onClick: (selectedIds: string[]) => void;
  /** Variante do botão */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Se a ação está desabilitada */
  disabled?: boolean;
  /** Tooltip (opcional) */
  tooltip?: string;
}

export interface SelectionToolbarProps {
  /** IDs selecionados */
  selectedIds: string[];
  /** Total de itens disponíveis */
  totalItems: number;
  /** Callback para limpar seleção */
  onClear: () => void;
  /** Callback para selecionar todos */
  onSelectAll?: () => void;
  /** Ações disponíveis */
  actions?: SelectionAction[];
  /** Ações padrão a incluir */
  defaultActions?: {
    view?: boolean;
    edit?: boolean;
    duplicate?: boolean;
    delete?: boolean;
    export?: boolean;
  };
  /** Handlers para ações padrão */
  handlers?: {
    onView?: (ids: string[]) => void;
    onEdit?: (ids: string[]) => void;
    onDuplicate?: (ids: string[]) => void;
    onDelete?: (ids: string[]) => void;
    onExport?: (ids: string[]) => void;
  };
  /** Posição da toolbar */
  position?: 'top' | 'bottom';
  /** Classes adicionais */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SelectionToolbar({
  selectedIds,
  totalItems,
  onClear,
  onSelectAll,
  actions = [],
  defaultActions = {},
  handlers = {},
  position = 'bottom',
  className,
}: SelectionToolbarProps) {
  const selectedCount = selectedIds.length;
  const isAllSelected = selectedCount === totalItems && totalItems > 0;

  // Construir lista de ações
  const allActions: SelectionAction[] = [];

  // Ações padrão
  if (defaultActions.view && handlers.onView) {
    allActions.push({
      id: 'view',
      label: 'Visualizar',
      icon: Eye,
      onClick: handlers.onView,
      variant: 'outline',
    });
  }

  if (defaultActions.edit && handlers.onEdit) {
    allActions.push({
      id: 'edit',
      label: 'Editar',
      icon: Edit,
      onClick: handlers.onEdit,
      variant: 'outline',
    });
  }

  if (defaultActions.duplicate && handlers.onDuplicate) {
    allActions.push({
      id: 'duplicate',
      label: 'Duplicar',
      icon: Copy,
      onClick: handlers.onDuplicate,
      variant: 'outline',
    });
  }

  if (defaultActions.export && handlers.onExport) {
    allActions.push({
      id: 'export',
      label: 'Exportar',
      icon: Download,
      onClick: handlers.onExport,
      variant: 'outline',
    });
  }

  if (defaultActions.delete && handlers.onDelete) {
    allActions.push({
      id: 'delete',
      label: 'Excluir',
      icon: Trash2,
      onClick: handlers.onDelete,
      variant: 'destructive',
    });
  }

  // Ações customizadas
  allActions.push(...actions);

  // Dividir ações em principais e secundárias
  const primaryActions = allActions.slice(0, 3);
  const secondaryActions = allActions.slice(3);

  if (selectedCount === 0) return null;

  const positionClasses = position === 'top' ? 'top-4' : 'bottom-4';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
        className={cn(
          'fixed left-1/2 -translate-x-1/2 z-50',
          positionClasses,
          className
        )}
      >
        <Card className="bg-white dark:bg-slate-900 border-gray-200/50 dark:border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3">
            {/* Contador de seleção */}
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg">
              <span className="font-semibold text-primary">
                {selectedCount}
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedCount === 1 ? 'item' : 'itens'} selecionado
                {selectedCount > 1 ? 's' : ''}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-border" />

            {/* Selecionar todos */}
            {onSelectAll && !isAllSelected && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSelectAll}
                  className="text-xs"
                >
                  Selecionar todos ({totalItems})
                </Button>
                <div className="w-px h-6 bg-border" />
              </>
            )}

            {/* Ações principais */}
            {primaryActions.map(action => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => action.onClick(selectedIds)}
                disabled={action.disabled}
                className="gap-2"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </Button>
            ))}

            {/* Ações secundárias (dropdown) */}
            {secondaryActions.length > 0 && (
              <>
                <div className="w-px h-6 bg-border" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Mais acoes">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {secondaryActions.map((action, index) => (
                      <React.Fragment key={action.id}>
                        {index > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={() => action.onClick(selectedIds)}
                          disabled={action.disabled}
                          className={cn(
                            action.variant === 'destructive' &&
                              'text-destructive focus:text-destructive'
                          )}
                        >
                          <action.icon className="w-4 h-4 mr-2" />
                          {action.label}
                        </DropdownMenuItem>
                      </React.Fragment>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-border" />

            {/* Botão de limpar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Limpar selecao"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default SelectionToolbar;
