'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Loader2,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
} from 'lucide-react';
import type {
  Column,
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderColumnsRequest,
} from '@/types/tasks';

interface BoardSettingsColumnsProps {
  columns: Column[];
  createColumn: {
    mutateAsync: (data: CreateColumnRequest) => Promise<unknown>;
    isPending: boolean;
  };
  updateColumn: {
    mutateAsync: (variables: {
      columnId: string;
      data: UpdateColumnRequest;
    }) => Promise<unknown>;
  };
  deleteColumn: {
    mutateAsync: (columnId: string) => Promise<unknown>;
  };
  reorderColumns: {
    mutateAsync: (data: ReorderColumnsRequest) => Promise<unknown>;
  };
}

export function BoardSettingsColumns({
  columns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
}: BoardSettingsColumnsProps) {
  const [newColumnName, setNewColumnName] = useState('');
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);

  async function handleAddColumn() {
    if (!newColumnName.trim()) return;

    try {
      await createColumn.mutateAsync({
        title: newColumnName.trim(),
        position: columns.length,
      });
      setNewColumnName('');
      toast.success('Coluna adicionada!');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao adicionar coluna.';
      toast.error(message);
    }
  }

  async function handleUpdateColumnName(columnId: string) {
    if (!editingColumnName.trim()) {
      setEditingColumnId(null);
      return;
    }

    try {
      await updateColumn.mutateAsync({
        columnId,
        data: { title: editingColumnName.trim() },
      });
      setEditingColumnId(null);
      toast.success('Coluna atualizada!');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar coluna.';
      toast.error(message);
    }
  }

  async function handleDeleteColumn(columnId: string) {
    try {
      await deleteColumn.mutateAsync(columnId);
      setDeletingColumnId(null);
      toast.success('Coluna removida!');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao remover coluna.';
      toast.error(message);
    }
  }

  async function handleMoveColumn(column: Column, direction: 'up' | 'down') {
    const currentIndex = columns.findIndex(c => c.id === column.id);
    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const reordered = [...columns];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      await reorderColumns.mutateAsync({
        columnIds: reordered.map(c => c.id),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao reordenar colunas.';
      toast.error(message);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Colunas</h3>

      <div className="space-y-1">
        {columns.map((column, index) => (
          <div
            key={column.id}
            className="flex items-center gap-2 rounded-md border px-3 py-2"
          >
            {/* Color dot */}
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: column.color ?? '#6b7280' }}
            />

            {/* Name or edit input */}
            {editingColumnId === column.id ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={editingColumnName}
                  onChange={e => setEditingColumnName(e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter')
                      handleUpdateColumnName(column.id);
                    if (e.key === 'Escape') setEditingColumnId(null);
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleUpdateColumnName(column.id)}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setEditingColumnId(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-sm flex-1">{column.title}</span>

                <div className="flex items-center gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={index === 0}
                    onClick={() => handleMoveColumn(column, 'up')}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={index === columns.length - 1}
                    onClick={() => handleMoveColumn(column, 'down')}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditingColumnId(column.id);
                      setEditingColumnName(column.title);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  {deletingColumnId === column.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setDeletingColumnId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeletingColumnId(column.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add column */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nome da nova coluna"
          value={newColumnName}
          onChange={e => setNewColumnName(e.target.value)}
          className="text-sm"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddColumn();
            }
          }}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddColumn}
          disabled={!newColumnName.trim() || createColumn.isPending}
        >
          {createColumn.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1" />
          )}
          Adicionar
        </Button>
      </div>
    </div>
  );
}
