'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Zap,
  CheckCircle2,
  Clock,
  Filter,
  Play,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { aiWorkflowsService } from '@/services/ai';
import type { AiWorkflow, AiWorkflowTrigger } from '@/types/ai';

interface CreateWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (workflow: AiWorkflow) => void;
}

const TRIGGER_LABELS: Record<
  AiWorkflowTrigger,
  { label: string; icon: React.ElementType }
> = {
  SCHEDULE: { label: 'Agendado', icon: Clock },
  EVENT: { label: 'Evento', icon: Zap },
  MANUAL: { label: 'Manual', icon: Play },
  CONDITION: { label: 'Condicional', icon: Filter },
};

export function CreateWorkflowModal({
  open,
  onClose,
  onCreated,
}: CreateWorkflowModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [parsedWorkflow, setParsedWorkflow] = useState<AiWorkflow | null>(null);

  const createMutation = useMutation({
    mutationFn: aiWorkflowsService.create,
    onSuccess: data => {
      setParsedWorkflow(data);
      if (step === 1) {
        setStep(2);
      } else {
        queryClient.invalidateQueries({ queryKey: ['ai', 'workflows'] });
        toast.success('Workflow criado com sucesso!');
        onCreated?.(data);
        handleClose();
      }
    },
    onError: () => {
      toast.error('Erro ao processar o workflow. Tente novamente.');
    },
  });

  const handleInterpret = useCallback(() => {
    if (!naturalPrompt.trim()) {
      toast.error('Descreva o que deseja automatizar.');
      return;
    }
    createMutation.mutate({ naturalPrompt: naturalPrompt.trim() });
  }, [naturalPrompt, createMutation]);

  const handleConfirm = useCallback(() => {
    if (parsedWorkflow) {
      queryClient.invalidateQueries({ queryKey: ['ai', 'workflows'] });
      toast.success('Workflow criado com sucesso!');
      onCreated?.(parsedWorkflow);
      handleClose();
    }
  }, [parsedWorkflow, queryClient, onCreated]);

  const handleClose = useCallback(() => {
    setStep(1);
    setNaturalPrompt('');
    setParsedWorkflow(null);
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[85vh] overflow-hidden rounded-2xl bg-background shadow-2xl border border-border flex flex-col">
        {/* Header */}
        <div className="relative overflow-hidden px-6 py-4 bg-gradient-to-br from-violet-600 to-cyan-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Novo Workflow</h2>
              <p className="text-sm text-white/70">Passo {step} de 3</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Natural language description */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descreva o que deseja automatizar
                </label>
                <textarea
                  value={naturalPrompt}
                  onChange={e => setNaturalPrompt(e.target.value)}
                  placeholder="Ex: Quando um produto atingir estoque minimo, criar alerta para o gerente e gerar pedido de compra automaticamente..."
                  rows={6}
                  className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Exemplos:</p>
                <p>- &quot;Enviar relatorio de vendas todo dia as 8h&quot;</p>
                <p>
                  - &quot;Quando cliente fizer pedido acima de R$5.000,
                  notificar gerente&quot;
                </p>
                <p>
                  - &quot;A cada sexta-feira, gerar previsao de estoque para a
                  semana seguinte&quot;
                </p>
              </div>
            </div>
          )}

          {/* Step 2: AI interpretation */}
          {step === 2 && parsedWorkflow && (
            <div className="space-y-4">
              <Card className="p-4 bg-violet-500/5 border-violet-500/20">
                <h4 className="font-semibold text-sm mb-1">
                  {parsedWorkflow.name}
                </h4>
                {parsedWorkflow.description && (
                  <p className="text-xs text-muted-foreground">
                    {parsedWorkflow.description}
                  </p>
                )}
              </Card>

              {/* Trigger */}
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Gatilho
                </h5>
                <Card className="p-3 flex items-center gap-3">
                  {(() => {
                    const triggerInfo = TRIGGER_LABELS[parsedWorkflow.trigger];
                    const TriggerIcon = triggerInfo.icon;
                    return (
                      <>
                        <div className="p-2 rounded-lg bg-sky-500/10">
                          <TriggerIcon className="h-4 w-4 text-sky-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {triggerInfo.label}
                          </p>
                          {parsedWorkflow.triggerConfig && (
                            <p className="text-xs text-muted-foreground">
                              {JSON.stringify(parsedWorkflow.triggerConfig)}
                            </p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </Card>
              </div>

              {/* Conditions */}
              {parsedWorkflow.conditions.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Condicoes
                  </h5>
                  <div className="space-y-2">
                    {parsedWorkflow.conditions.map((cond, i) => (
                      <Card key={i} className="p-3 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Filter className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-sm">
                          {cond.field} {cond.operator} {cond.value}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {parsedWorkflow.actions.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Acoes
                  </h5>
                  <div className="space-y-2">
                    {parsedWorkflow.actions.map(action => (
                      <Card
                        key={action.id}
                        className="p-3 flex items-center gap-3"
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <Zap className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {action.displayName}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[10px] mt-0.5"
                          >
                            {action.module}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <h3 className="text-lg font-semibold">Workflow Pronto!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Seu workflow foi interpretado e esta pronto para ser salvo. Voce
                pode ativa-lo a qualquer momento.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={
              step > 1
                ? () => setStep(s => Math.max(1, s - 1) as 1 | 2 | 3)
                : handleClose
            }
          >
            {step > 1 ? (
              <>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </>
            ) : (
              'Cancelar'
            )}
          </Button>

          {step === 1 && (
            <Button
              onClick={handleInterpret}
              disabled={!naturalPrompt.trim() || createMutation.isPending}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Interpretando...
                </>
              ) : (
                <>
                  Interpretar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}

          {step === 2 && (
            <Button
              onClick={() => setStep(3)}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
            >
              Confirmar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {step === 3 && (
            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Salvar Workflow
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
