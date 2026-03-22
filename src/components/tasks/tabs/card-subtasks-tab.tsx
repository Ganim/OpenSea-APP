'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Trash2,
  ListChecks,
  CalendarClock,
  ExternalLink,
} from 'lucide-react';
import {
  useSubtasks,
  useCreateSubtask,
  useCompleteSubtask,
  useDeleteSubtask,
} from '@/hooks/tasks/use-subtasks';
import { MemberAvatar } from '@/components/tasks/shared/member-avatar';
import { cn } from '@/lib/utils';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/tasks';
import type { Card } from '@/types/tasks';

interface CardSubtasksTabProps {
  boardId: string;
  cardId: string;
  onOpenSubtask?: (subtaskId: string) => void;
}

function formatDueDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function CardSubtasksTab({
  boardId,
  cardId,
  onOpenSubtask,
}: CardSubtasksTabProps) {
  const { data: subtasksData, isLoading } = useSubtasks(boardId, cardId);
  const createSubtask = useCreateSubtask(boardId, cardId);
  const completeSubtask = useCompleteSubtask(boardId, cardId);
  const deleteSubtask = useDeleteSubtask(boardId, cardId);

  const subtasks: Card[] = subtasksData?.subtasks ?? [];

  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = useCallback(() => {
    const title = newTitle.trim();
    if (!title) return;

    createSubtask.mutate(
      { title },
      {
        onSuccess: () => {
          setNewTitle('');
          toast.success('Subtarefa criada');
        },
        onError: () =>
          toast.error('Não foi possível criar a subtarefa. Tente novamente.'),
      }
    );
  }, [newTitle, createSubtask]);

  const handleToggleComplete = useCallback(
    (subtaskId: string, currentStatus: string) => {
      const completed = currentStatus !== 'DONE';
      completeSubtask.mutate(
        { subtaskId, completed },
        {
          onError: () =>
            toast.error(
              'Não foi possível atualizar a subtarefa. Tente novamente.'
            ),
        }
      );
    },
    [completeSubtask]
  );

  const handleDelete = useCallback(
    (subtaskId: string) => {
      deleteSubtask.mutate(subtaskId, {
        onSuccess: () => toast.success('Subtarefa removida'),
        onError: () =>
          toast.error('Não foi possível remover a subtarefa. Tente novamente.'),
      });
    },
    [deleteSubtask]
  );

  // Progress
  const completedCount = subtasks.filter(s => s.status === 'DONE').length;
  const totalCount = subtasks.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-3 flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-secondary-foreground/70" />
          <span className="text-sm font-semibold text-secondary-foreground">
            Subtarefas
          </span>
          {subtasks.length > 0 && (
            <span className="text-xs text-secondary-foreground/60">
              ({subtasks.length})
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1 text-secondary-foreground/70 hover:text-secondary-foreground"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>

      {/* Inline create */}
      {showCreate && (
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreate();
              }
              if (e.key === 'Escape') {
                setShowCreate(false);
                setNewTitle('');
              }
            }}
            placeholder="Adicionar subtarefa..."
            className="h-8 text-sm"
            autoFocus
            disabled={createSubtask.isPending}
          />
          {newTitle.trim() && (
            <Button
              size="sm"
              className="h-8 shrink-0"
              onClick={handleCreate}
              disabled={createSubtask.isPending}
            >
              Criar
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 shrink-0"
            onClick={() => {
              setShowCreate(false);
              setNewTitle('');
            }}
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completedCount} de {totalCount} concluídas
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtask list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : subtasks.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <ListChecks className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">Nenhuma subtarefa</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {subtasks.map(subtask => {
            const isDone = subtask.status === 'DONE';
            const priorityConfig = PRIORITY_CONFIG[subtask.priority];
            const statusConfig = STATUS_CONFIG[subtask.status];
            const isOverdue =
              subtask.dueDate &&
              new Date(subtask.dueDate) < new Date() &&
              !isDone;

            return (
              <div
                key={subtask.id}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border px-3 py-2 group transition-colors',
                  isDone
                    ? 'border-border/30 bg-muted/20'
                    : 'border-border bg-card hover:bg-muted/30'
                )}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={isDone}
                  onCheckedChange={() =>
                    handleToggleComplete(subtask.id, subtask.status)
                  }
                  className="shrink-0"
                />

                {/* Content — clickable */}
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => onOpenSubtask?.(subtask.id)}
                >
                  <span
                    className={cn(
                      'text-sm font-medium block truncate',
                      isDone && 'line-through text-muted-foreground'
                    )}
                  >
                    {subtask.title}
                  </span>
                </button>

                {/* Meta badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Priority dot */}
                  {subtask.priority !== 'NONE' && (
                    <span
                      title={priorityConfig.label}
                      className={cn(
                        'h-2 w-2 rounded-full shrink-0',
                        priorityConfig.dotColor
                      )}
                    />
                  )}

                  {/* Status badge */}
                  {subtask.status !== 'OPEN' && (
                    <span
                      className={cn(
                        'text-[10px] font-medium px-1.5 py-0.5 rounded',
                        isDone &&
                          'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
                        subtask.status === 'IN_PROGRESS' &&
                          'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
                        subtask.status === 'CANCELED' &&
                          'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  )}

                  {/* Due date */}
                  {subtask.dueDate && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 text-[10px]',
                        isOverdue ? 'text-rose-500' : 'text-muted-foreground'
                      )}
                    >
                      <CalendarClock className="h-3 w-3" />
                      {formatDueDate(subtask.dueDate)}
                    </span>
                  )}

                  {/* Assignee */}
                  {subtask.assigneeName && (
                    <MemberAvatar
                      name={subtask.assigneeName}
                      size="sm"
                      className="h-5 w-5 text-[8px]"
                    />
                  )}
                </div>

                {/* Actions on hover */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onOpenSubtask && (
                    <button
                      type="button"
                      title="Abrir subtarefa"
                      className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => onOpenSubtask(subtask.id)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Remover"
                    className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    onClick={() => handleDelete(subtask.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
