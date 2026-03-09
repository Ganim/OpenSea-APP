'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Pencil,
  CheckCircle2,
  ArrowRightLeft,
  ArrowUpDown,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Card, Column } from '@/types/tasks';
import { useUpdateColumn, useDeleteColumn } from '@/hooks/tasks/use-columns';
import { useMoveCard } from '@/hooks/tasks/use-cards';
import { toast } from 'sonner';
import { ColumnColorPicker } from './column-color-picker';
import { ColumnWipLimitPopover } from './column-wip-limit-popover';
import { ColumnDeleteDialog } from './column-delete-dialog';

interface ColumnOptionsMenuProps {
  column: Column;
  boardId: string;
  allColumns: Column[];
  cards: Card[];
  onStartEditing: () => void;
}

export function ColumnOptionsMenu({
  column,
  boardId,
  allColumns,
  cards,
  onStartEditing,
}: ColumnOptionsMenuProps) {
  const updateColumn = useUpdateColumn(boardId);
  const deleteColumn = useDeleteColumn(boardId);
  const moveCard = useMoveCard(boardId);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const otherColumns = allColumns.filter(c => c.id !== column.id);

  // ─── Change color ───
  function handleChangeColor(color: string | null) {
    updateColumn.mutate(
      { columnId: column.id, data: { color } },
      {
        onSuccess: () => toast.success('Cor atualizada!'),
        onError: () => toast.error('Erro ao alterar cor.'),
      }
    );
  }

  // ─── WIP Limit ───
  function handleSaveWip(columnId: string, wipLimit: number | null) {
    updateColumn.mutate(
      { columnId, data: { wipLimit } },
      {
        onError: () => toast.error('Erro ao definir limite.'),
      }
    );
  }

  // ─── Toggle isDone ───
  function handleToggleDone() {
    updateColumn.mutate(
      { columnId: column.id, data: { isDone: !column.isDone } },
      {
        onSuccess: () =>
          toast.success(
            column.isDone
              ? 'Coluna desmarcada como concluída.'
              : 'Coluna marcada como concluída!'
          ),
        onError: () => toast.error('Erro ao atualizar coluna.'),
      }
    );
  }

  // ─── Move all cards to another column ───
  async function handleMoveAllCards(targetColumnId: string) {
    if (cards.length === 0) {
      toast.info('Nenhum cartão para mover.');
      return;
    }

    const targetCol = otherColumns.find(c => c.id === targetColumnId);
    try {
      for (let i = 0; i < cards.length; i++) {
        await moveCard.mutateAsync({
          cardId: cards[i].id,
          data: { columnId: targetColumnId, position: i },
        });
      }
      toast.success(
        `${cards.length} cartão(s) movido(s) para "${targetCol?.title}".`
      );
    } catch {
      toast.error('Erro ao mover cartões.');
    }
  }

  // ─── Sort cards within this column ───
  async function handleSortCards(sortBy: 'title' | 'priority' | 'dueDate') {
    if (cards.length <= 1) return;

    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3, NONE: 4 };

    const sorted = [...cards].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'pt-BR');
      if (sortBy === 'priority')
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    try {
      await Promise.all(
        sorted.map((card, index) =>
          moveCard.mutateAsync({
            cardId: card.id,
            data: { columnId: column.id, position: index },
          })
        )
      );
      const labels: Record<string, string> = {
        title: 'nome',
        priority: 'prioridade',
        dueDate: 'vencimento',
      };
      toast.success(`Cartões ordenados por ${labels[sortBy]}.`);
    } catch {
      toast.error('Erro ao ordenar cartões.');
    }
  }

  // ─── Delete column ───
  function handleDeleteColumn() {
    deleteColumn.mutate(column.id, {
      onSuccess: () => {
        toast.success('Coluna excluída.');
        setShowDeleteDialog(false);
      },
      onError: () => toast.error('Erro ao excluir coluna.'),
    });
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'p-1 rounded transition-opacity shrink-0',
              'opacity-0 group-hover/header:opacity-60 hover:!opacity-100',
              'hover:bg-black/5 dark:hover:bg-white/10',
              menuOpen && '!opacity-100'
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-52">
          {/* Rename */}
          <DropdownMenuItem
            onClick={() => {
              setMenuOpen(false);
              setTimeout(onStartEditing, 50);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Renomear
          </DropdownMenuItem>

          {/* Change color */}
          <ColumnColorPicker
            currentColor={column.color}
            onChangeColor={handleChangeColor}
          />

          {/* WIP Limit */}
          <ColumnWipLimitPopover
            columnId={column.id}
            wipLimit={column.wipLimit}
            onSaveWip={handleSaveWip}
          />

          {/* Toggle isDone */}
          <DropdownMenuItem onClick={handleToggleDone}>
            <CheckCircle2
              className={cn('h-4 w-4 mr-2', column.isDone && 'text-green-500')}
            />
            {column.isDone ? 'Desmarcar concluída' : 'Marcar como concluída'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Move all cards */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={cards.length === 0 || otherColumns.length === 0}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Mover cartões para...
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {otherColumns.map(col => (
                <DropdownMenuItem
                  key={col.id}
                  onClick={() => handleMoveAllCards(col.id)}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 mr-2"
                    style={{ backgroundColor: col.color ?? '#6b7280' }}
                  />
                  {col.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Sort cards */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={cards.length <= 1}>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Ordenar cartões por...
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleSortCards('title')}>
                Nome (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortCards('priority')}>
                Prioridade
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortCards('dueDate')}>
                Vencimento
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Delete column */}
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
            disabled={column.isDefault}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir coluna
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <ColumnDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        columnTitle={column.title}
        cardCount={cards.length}
        onConfirm={handleDeleteColumn}
      />
    </>
  );
}
