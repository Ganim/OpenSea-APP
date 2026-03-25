'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiWorkflowsService } from '@/services/ai';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Loader2,
  Zap,
  Clock,
  Play,
  Filter,
  MoreVertical,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  CircleDot,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Workflow,
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateWorkflowModal } from './create-workflow-modal';
import type {
  AiWorkflow,
  AiWorkflowTrigger,
  AiWorkflowStatus,
  AiWorkflowExecutionStatus,
} from '@/types/ai';

const TRIGGER_CONFIG: Record<
  AiWorkflowTrigger,
  { label: string; icon: React.ElementType; color: string }
> = {
  SCHEDULE: { label: 'Agendado', icon: Clock, color: 'text-sky-500' },
  EVENT: { label: 'Evento', icon: Zap, color: 'text-violet-500' },
  MANUAL: { label: 'Manual', icon: Play, color: 'text-emerald-500' },
  CONDITION: { label: 'Condicional', icon: Filter, color: 'text-amber-500' },
};

const STATUS_CONFIG: Record<
  AiWorkflowStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  ACTIVE: { label: 'Ativo', variant: 'default' },
  INACTIVE: { label: 'Inativo', variant: 'secondary' },
  DRAFT: { label: 'Rascunho', variant: 'outline' },
  ERROR: { label: 'Erro', variant: 'destructive' },
};

const EXECUTION_STATUS_CONFIG: Record<
  AiWorkflowExecutionStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  PENDING: {
    label: 'Pendente',
    icon: CircleDot,
    color: 'text-muted-foreground',
  },
  RUNNING: { label: 'Executando', icon: Loader2, color: 'text-sky-500' },
  SUCCESS: { label: 'Sucesso', icon: CheckCircle2, color: 'text-emerald-500' },
  FAILED: { label: 'Falhou', icon: XCircle, color: 'text-rose-500' },
  CANCELLED: { label: 'Cancelado', icon: AlertCircle, color: 'text-amber-500' },
};

export function AiWorkflowsView() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['ai', 'workflows'],
    queryFn: async () => {
      const response = await aiWorkflowsService.list({ limit: 50 });
      return response.workflows;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AiWorkflowStatus }) =>
      aiWorkflowsService.update(id, {
        status: status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'workflows'] });
    },
    onError: () => {
      toast.error('Erro ao atualizar status do workflow.');
    },
  });

  const runMutation = useMutation({
    mutationFn: aiWorkflowsService.run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'workflows'] });
      toast.success('Workflow executado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao executar workflow.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: aiWorkflowsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'workflows'] });
      toast.success('Workflow excluido.');
    },
    onError: () => {
      toast.error('Erro ao excluir workflow.');
    },
  });

  const { data: executionsData } = useQuery({
    queryKey: ['ai', 'workflow-executions', expandedId],
    queryFn: async () => {
      if (!expandedId) return [];
      return aiWorkflowsService.getExecutions(expandedId);
    },
    enabled: !!expandedId,
  });

  const workflows = data ?? [];

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Workflows</h3>
          <p className="text-sm text-muted-foreground">
            Automacoes inteligentes baseadas em linguagem natural
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Workflow
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Workflow className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">Nenhum workflow criado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crie automacoes descrevendo o que deseja em linguagem natural.
          </p>
          <Button variant="outline" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar primeiro workflow
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow: AiWorkflow) => {
            const triggerConfig = TRIGGER_CONFIG[workflow.trigger];
            const statusConfig = STATUS_CONFIG[workflow.status];
            const TriggerIcon = triggerConfig.icon;
            const isExpanded = expandedId === workflow.id;

            return (
              <Card key={workflow.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          'p-2 rounded-lg shrink-0',
                          workflow.status === 'ACTIVE'
                            ? 'bg-emerald-500/10'
                            : 'bg-muted'
                        )}
                      >
                        <TriggerIcon
                          className={cn('h-4 w-4', triggerConfig.color)}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm truncate">
                            {workflow.name}
                          </h4>
                          <Badge
                            variant={statusConfig.variant}
                            className="text-[10px]"
                          >
                            {statusConfig.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {triggerConfig.label}
                          </Badge>
                        </div>

                        {workflow.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {workflow.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{workflow.runCount} execucoes</span>
                          {workflow.lastRunAt && (
                            <span>
                              Ultima:{' '}
                              {formatDistanceToNow(
                                new Date(workflow.lastRunAt),
                                {
                                  addSuffix: true,
                                  locale: ptBR,
                                }
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Toggle active/inactive */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleMutation.mutate({
                            id: workflow.id,
                            status: workflow.status,
                          })
                        }
                        className={cn(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                          workflow.status === 'ACTIVE'
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/30'
                        )}
                        title={
                          workflow.status === 'ACTIVE' ? 'Desativar' : 'Ativar'
                        }
                      >
                        <span
                          className={cn(
                            'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                            workflow.status === 'ACTIVE'
                              ? 'translate-x-4.5'
                              : 'translate-x-0.5'
                          )}
                        />
                      </button>

                      {/* Run now */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => runMutation.mutate(workflow.id)}
                        disabled={runMutation.isPending}
                        title="Executar agora"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>

                      {/* More actions */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setMenuOpenId(
                              menuOpenId === workflow.id ? null : workflow.id
                            )
                          }
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>

                        {menuOpenId === workflow.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border rounded-lg shadow-lg z-10 py-1">
                            <button
                              type="button"
                              className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2"
                              onClick={() => setMenuOpenId(null)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </button>
                            <button
                              type="button"
                              className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-rose-500"
                              onClick={() => {
                                setMenuOpenId(null);
                                deleteMutation.mutate(workflow.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expand executions */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : workflow.id)
                        }
                        title="Historico de execucoes"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Executions history */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/30 px-4 py-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Historico de Execucoes
                    </h5>
                    {!executionsData || executionsData.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        Nenhuma execucao registrada.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {executionsData.map(exec => {
                          const execConfig =
                            EXECUTION_STATUS_CONFIG[exec.status];
                          const ExecIcon = execConfig.icon;
                          return (
                            <div
                              key={exec.id}
                              className="flex items-center justify-between py-1.5 px-2 rounded-md bg-background"
                            >
                              <div className="flex items-center gap-2">
                                <ExecIcon
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    execConfig.color,
                                    exec.status === 'RUNNING' && 'animate-spin'
                                  )}
                                />
                                <span className="text-xs font-medium">
                                  {execConfig.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {exec.duration && (
                                  <span>{exec.duration}ms</span>
                                )}
                                <span>
                                  {formatDistanceToNow(
                                    new Date(exec.createdAt),
                                    { addSuffix: true, locale: ptBR }
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <CreateWorkflowModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
