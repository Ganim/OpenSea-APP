/**
 * Print Agents Management Page
 * Gerenciamento de agentes de impressao remota
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { printAgentsService } from '@/services/sales/print-agents.service';
import type { PrintAgent, AgentStatus } from '@/types/sales';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Check,
  CircleDot,
  Copy,
  Key,
  MonitorSmartphone,
  Plus,
  Router,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import Link from 'next/link';

const AGENT_STATUS_CONFIG: Record<
  AgentStatus,
  { color: string; dotColor: string; label: string; icon: React.ElementType }
> = {
  ONLINE: {
    color:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20',
    dotColor: 'bg-green-500',
    label: 'Online',
    icon: Wifi,
  },
  OFFLINE: {
    color:
      'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20',
    dotColor: 'bg-gray-400',
    label: 'Offline',
    icon: WifiOff,
  },
  ERROR: {
    color:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    dotColor: 'bg-rose-500',
    label: 'Erro',
    icon: AlertTriangle,
  },
};

export default function PrintAgentsPage() {
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const canAdmin = hasPermission('sales.printing.admin');

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [agentName, setAgentName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);
  const [regenAgentId, setRegenAgentId] = useState<string | null>(null);
  const [regenKey, setRegenKey] = useState<string | null>(null);
  const [regenCopied, setRegenCopied] = useState(false);

  const {
    data: agentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['print-agents'],
    queryFn: async () => {
      const response = await printAgentsService.list();
      return response.agents;
    },
    refetchInterval: 30000,
  });

  const agents = agentsData ?? [];

  const handleRegister = useCallback(async () => {
    if (!agentName.trim()) return;
    setIsRegistering(true);
    try {
      const result = await printAgentsService.register(agentName.trim());
      setGeneratedKey(result.apiKey);
      setRegisterStep(2);
      queryClient.invalidateQueries({ queryKey: ['print-agents'] });
    } catch {
      toast.error('Erro ao registrar agente');
    } finally {
      setIsRegistering(false);
    }
  }, [agentName, queryClient]);

  const handleCopyKey = useCallback(
    (key: string, setCopied: (v: boolean) => void) => {
      navigator.clipboard.writeText(key);
      setCopied(true);
      toast.success('Chave copiada');
      setTimeout(() => setCopied(false), 2000);
    },
    []
  );

  const handleDelete = useCallback(
    async (agentId: string) => {
      try {
        await printAgentsService.delete(agentId);
        queryClient.invalidateQueries({ queryKey: ['print-agents'] });
        toast.success('Agente removido');
      } catch {
        toast.error('Erro ao remover agente');
      } finally {
        setDeleteAgentId(null);
      }
    },
    [queryClient]
  );

  const handleRegenerateKey = useCallback(
    async (agentId: string) => {
      try {
        const result = await printAgentsService.regenerateKey(agentId);
        setRegenKey(result.apiKey);
        queryClient.invalidateQueries({ queryKey: ['print-agents'] });
      } catch {
        toast.error('Erro ao regenerar chave');
      }
    },
    [queryClient]
  );

  const closeRegisterDialog = () => {
    setRegisterOpen(false);
    setRegisterStep(1);
    setAgentName('');
    setGeneratedKey(null);
    setCopiedKey(false);
  };

  const registerSteps: WizardStep[] = [
    {
      title: 'Nome do Agente',
      description: 'Identifique o computador que executara o agente',
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
          <MonitorSmartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Nome do agente</Label>
            <Input
              id="agent-name"
              placeholder="Ex: Computador do Estoque"
              value={agentName}
              onChange={e => setAgentName(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Um nome descritivo para identificar o computador onde o agente
              sera instalado.
            </p>
          </div>
        </div>
      ),
      isValid: agentName.trim().length > 0 && !isRegistering,
      footer: (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeRegisterDialog}>
            Cancelar
          </Button>
          <Button
            onClick={handleRegister}
            disabled={!agentName.trim() || isRegistering}
          >
            {isRegistering ? 'Registrando...' : 'Registrar'}
          </Button>
        </div>
      ),
    },
    {
      title: 'Chave de API',
      description: 'Copie a chave para configurar o agente',
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
          <Key className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Esta chave sera exibida apenas uma vez. Copie-a agora.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chave de API</Label>
            <div className="flex gap-2">
              <code className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono break-all select-all border border-border">
                {generatedKey ?? '...'}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="h-auto shrink-0"
                onClick={() =>
                  generatedKey && handleCopyKey(generatedKey, setCopiedKey)
                }
              >
                {copiedKey ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ),
      isValid: true,
      footer: (
        <div className="flex justify-end">
          <Button onClick={closeRegisterDialog}>Concluir</Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Impressao', href: '/print/studio' },
            { label: 'Agentes' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/print/studio">
                <Button variant="outline" size="sm" className="h-9 px-2.5">
                  <Router className="w-4 h-4 mr-1" />
                  Studio
                </Button>
              </Link>
              {canAdmin && (
                <Button
                  size="sm"
                  className="h-9 px-2.5"
                  onClick={() => setRegisterOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Registrar Agente
                </Button>
              )}
            </div>
          }
        />
      </PageHeader>

      <PageBody>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agentes de Impressao
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os computadores conectados para impressao remota
            </p>
          </div>

          {/* Agent List */}
          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-5 bg-white dark:bg-slate-800/60 border border-border animate-pulse"
                >
                  <div className="h-16" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 bg-white dark:bg-slate-800/60 border border-border text-center">
              <p className="text-sm text-muted-foreground">
                Erro ao carregar agentes
              </p>
            </Card>
          ) : agents.length === 0 ? (
            <Card className="p-12 bg-white dark:bg-slate-800/60 border border-border text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <MonitorSmartphone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Nenhum agente registrado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Registre um agente para comecar a imprimir remotamente.
              </p>
              {canAdmin && (
                <Button onClick={() => setRegisterOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Registrar Agente
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4">
              {agents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  canAdmin={canAdmin}
                  onDelete={() => setDeleteAgentId(agent.id)}
                  onRegenerateKey={() => {
                    setRegenAgentId(agent.id);
                    handleRegenerateKey(agent.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </PageBody>

      {/* Register Agent Dialog */}
      <StepWizardDialog
        open={registerOpen}
        onOpenChange={open => {
          if (!open) closeRegisterDialog();
        }}
        steps={registerSteps}
        currentStep={registerStep}
        onStepChange={setRegisterStep}
        onClose={closeRegisterDialog}
      />

      {/* Delete Confirmation */}
      {deleteAgentId && (
        <VerifyActionPinModal
          isOpen={!!deleteAgentId}
          onClose={() => setDeleteAgentId(null)}
          onSuccess={() => handleDelete(deleteAgentId)}
          title="Confirmar Exclusao"
          description="Digite seu PIN de acao para excluir este agente de impressao."
        />
      )}

      {/* Regenerated Key Dialog */}
      {regenKey && (
        <StepWizardDialog
          open={!!regenKey}
          onOpenChange={open => {
            if (!open) {
              setRegenKey(null);
              setRegenAgentId(null);
              setRegenCopied(false);
            }
          }}
          steps={[
            {
              title: 'Nova Chave de API',
              description: 'A chave anterior foi invalidada',
              icon: (
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                  <Key className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
              ),
              content: (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        Esta chave sera exibida apenas uma vez. Copie-a agora.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nova chave de API</Label>
                    <div className="flex gap-2">
                      <code className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono break-all select-all border border-border">
                        {regenKey}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto shrink-0"
                        onClick={() => handleCopyKey(regenKey, setRegenCopied)}
                      >
                        {regenCopied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ),
              isValid: true,
              footer: (
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setRegenKey(null);
                      setRegenAgentId(null);
                      setRegenCopied(false);
                    }}
                  >
                    Concluir
                  </Button>
                </div>
              ),
            },
          ]}
          currentStep={1}
          onStepChange={() => {}}
          onClose={() => {
            setRegenKey(null);
            setRegenAgentId(null);
            setRegenCopied(false);
          }}
        />
      )}
    </PageLayout>
  );
}

// ============================================
// Agent Card Component
// ============================================

interface AgentCardProps {
  agent: PrintAgent;
  canAdmin: boolean;
  onDelete: () => void;
  onRegenerateKey: () => void;
}

function AgentCard({
  agent,
  canAdmin,
  onDelete,
  onRegenerateKey,
}: AgentCardProps) {
  const config = AGENT_STATUS_CONFIG[agent.status];
  const StatusIcon = config.icon;

  const lastSeen = agent.lastSeenAt
    ? formatDistanceToNow(new Date(agent.lastSeenAt), {
        addSuffix: true,
        locale: ptBR,
      })
    : 'Nunca visto';

  return (
    <Card className="p-5 bg-white dark:bg-slate-800/60 border border-border">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              agent.status === 'ONLINE'
                ? 'bg-green-100 dark:bg-green-500/10'
                : agent.status === 'ERROR'
                  ? 'bg-rose-100 dark:bg-rose-500/10'
                  : 'bg-gray-100 dark:bg-gray-500/10'
            )}
          >
            <StatusIcon
              className={cn(
                'w-5 h-5',
                agent.status === 'ONLINE'
                  ? 'text-green-600 dark:text-green-400'
                  : agent.status === 'ERROR'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-gray-500 dark:text-gray-400'
              )}
            />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {agent.name}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                  config.color
                )}
              >
                <span
                  className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)}
                />
                {config.label}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {agent.hostname && (
                <span className="flex items-center gap-1">
                  <MonitorSmartphone className="w-3 h-3" />
                  {agent.hostname}
                </span>
              )}
              {agent.ipAddress && (
                <span className="flex items-center gap-1">
                  <CircleDot className="w-3 h-3" />
                  {agent.ipAddress}
                </span>
              )}
              <span>
                {agent.printerCount} impressora
                {agent.printerCount !== 1 ? 's' : ''}
              </span>
              {agent.version && <span>v{agent.version}</span>}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Visto {lastSeen}
            </p>
          </div>
        </div>

        {/* Actions */}
        {canAdmin && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={onRegenerateKey}
            >
              <Key className="w-3 h-3 mr-1" />
              Regenerar Chave
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Excluir
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
