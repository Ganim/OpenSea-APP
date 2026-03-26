'use client';

import { useCallback, useMemo, useState } from 'react';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import {
  useCreateMessagingAccount,
  useDeleteMessagingAccount,
  useMessagingAccounts,
} from '@/hooks/messaging';
import type {
  CreateAccountRequest,
  MessagingAccountDTO,
  MessagingAccountStatus,
  MessagingChannel,
} from '@/types/messaging';
import { cn } from '@/lib/utils';
import {
  Camera,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';

// ─── Status Badge ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  MessagingAccountStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  ACTIVE: { label: 'Ativa', variant: 'default' },
  DISCONNECTED: { label: 'Desconectada', variant: 'secondary' },
  ERROR: { label: 'Erro', variant: 'destructive' },
  SUSPENDED: { label: 'Suspensa', variant: 'outline' },
};

// ─── Channel Config ──────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<
  MessagingChannel,
  {
    label: string;
    description: string;
    icon: typeof MessageCircle;
    color: string;
    gradient: string;
  }
> = {
  WHATSAPP: {
    label: 'WhatsApp',
    description:
      'Conecte seu número do WhatsApp Business para atender clientes.',
    icon: MessageCircle,
    color: 'text-green-500',
    gradient: 'from-green-500 to-emerald-600',
  },
  INSTAGRAM: {
    label: 'Instagram',
    description: 'Receba e responda mensagens do Instagram Direct.',
    icon: Camera,
    color: 'text-pink-500',
    gradient: 'from-pink-500 to-purple-600',
  },
  TELEGRAM: {
    label: 'Telegram',
    description: 'Conecte um bot do Telegram para atendimento automatizado.',
    icon: Send,
    color: 'text-sky-500',
    gradient: 'from-sky-500 to-blue-600',
  },
};

// ─── Account Card ────────────────────────────────────────────────────────────

function AccountCard({
  account,
  onDelete,
}: {
  account: MessagingAccountDTO;
  onDelete: (id: string) => void;
}) {
  const channel = CHANNEL_CONFIG[account.channel];
  const status = STATUS_MAP[account.status];
  const Icon = channel.icon;

  return (
    <Card className="bg-white dark:bg-white/5 border-gray-200/80 dark:border-white/10 p-5">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'p-3 rounded-xl bg-linear-to-br shrink-0',
            channel.gradient
          )}
        >
          <Icon className="size-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold truncate">{account.name}</h3>
            <Badge variant={status.variant} className="text-[10px] h-5">
              {account.status === 'ACTIVE' ? (
                <Wifi className="size-3 mr-1" />
              ) : (
                <WifiOff className="size-3 mr-1" />
              )}
              {status.label}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Canal: {channel.label}</p>
            {account.phoneNumber && <p>Telefone: {account.phoneNumber}</p>}
            {account.tgBotUsername && <p>Bot: @{account.tgBotUsername}</p>}
            {account.igAccountId && <p>Conta IG: {account.igAccountId}</p>}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0"
          onClick={() => onDelete(account.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Card>
  );
}

// ─── Connect Account Wizard ──────────────────────────────────────────────────

function ConnectAccountWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChannel, setSelectedChannel] =
    useState<MessagingChannel | null>(null);
  const [accountName, setAccountName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tgBotToken, setTgBotToken] = useState('');
  const [igAccessToken, setIgAccessToken] = useState('');
  const [createState, setCreateState] = useState<
    'idle' | 'creating' | 'success' | 'error'
  >('idle');
  const [createError, setCreateError] = useState('');

  const createMutation = useCreateMessagingAccount();

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setSelectedChannel(null);
    setAccountName('');
    setPhoneNumber('');
    setTgBotToken('');
    setIgAccessToken('');
    setCreateState('idle');
    setCreateError('');
    onOpenChange(false);
  }, [onOpenChange]);

  const handleCreate = useCallback(async () => {
    if (!selectedChannel || !accountName) return;

    setCreateState('creating');
    setCreateError('');

    try {
      const body: CreateAccountRequest = {
        channel: selectedChannel,
        name: accountName,
        ...(selectedChannel === 'WHATSAPP' ? { phoneNumber } : {}),
        ...(selectedChannel === 'TELEGRAM' ? { tgBotToken } : {}),
        ...(selectedChannel === 'INSTAGRAM' ? { igAccessToken } : {}),
      };

      await createMutation.mutateAsync(body);
      setCreateState('success');
    } catch (err) {
      setCreateState('error');
      setCreateError(
        err instanceof Error ? err.message : 'Erro ao conectar conta'
      );
    }
  }, [
    selectedChannel,
    accountName,
    phoneNumber,
    tgBotToken,
    igAccessToken,
    createMutation,
  ]);

  const step1Valid = selectedChannel !== null;
  const step2Valid = (() => {
    if (!accountName.trim()) return false;
    if (selectedChannel === 'WHATSAPP' && !phoneNumber.trim()) return false;
    if (selectedChannel === 'TELEGRAM' && !tgBotToken.trim()) return false;
    if (selectedChannel === 'INSTAGRAM' && !igAccessToken.trim()) return false;
    return true;
  })();

  const steps: WizardStep[] = useMemo(
    () => [
      // Step 1: Select Channel
      {
        title: 'Selecionar Canal',
        description: 'Escolha qual plataforma de mensagens deseja conectar',
        icon: <MessageCircle className="h-16 w-16 text-primary/60" />,
        isValid: step1Valid,
        content: (
          <div className="grid grid-cols-1 gap-3">
            {(['WHATSAPP', 'INSTAGRAM', 'TELEGRAM'] as MessagingChannel[]).map(
              ch => {
                const config = CHANNEL_CONFIG[ch];
                const Icon = config.icon;
                const isSelected = selectedChannel === ch;

                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSelectedChannel(ch)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-accent/50'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2.5 rounded-lg bg-linear-to-br',
                        config.gradient
                      )}
                    >
                      <Icon className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {config.description}
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        ),
      },
      // Step 2: Credentials
      {
        title: 'Configurar Conexão',
        description: selectedChannel
          ? `Insira os dados de acesso para ${CHANNEL_CONFIG[selectedChannel].label}`
          : 'Insira os dados de acesso',
        icon: selectedChannel ? (
          (() => {
            const Icon = CHANNEL_CONFIG[selectedChannel].icon;
            return (
              <Icon
                className={cn(
                  'h-16 w-16',
                  CHANNEL_CONFIG[selectedChannel].color
                )}
              />
            );
          })()
        ) : (
          <MessageCircle className="h-16 w-16 text-primary/60" />
        ),
        isValid: step2Valid,
        onBack: () => setCurrentStep(1),
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Nome da conta *</Label>
              <Input
                id="account-name"
                placeholder="Ex.: Atendimento Principal"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                autoFocus
              />
            </div>

            {selectedChannel === 'WHATSAPP' && (
              <div className="space-y-2">
                <Label htmlFor="phone-number">Número de telefone *</Label>
                <Input
                  id="phone-number"
                  placeholder="+55 11 99999-9999"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Insira o número completo com código do país.
                </p>
              </div>
            )}

            {selectedChannel === 'TELEGRAM' && (
              <div className="space-y-2">
                <Label htmlFor="tg-token">Token do Bot *</Label>
                <Input
                  id="tg-token"
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  value={tgBotToken}
                  onChange={e => setTgBotToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Obtenha o token através do @BotFather no Telegram.
                </p>
              </div>
            )}

            {selectedChannel === 'INSTAGRAM' && (
              <div className="space-y-2">
                <Label htmlFor="ig-token">Token de Acesso *</Label>
                <Input
                  id="ig-token"
                  placeholder="Token de acesso da API do Instagram"
                  value={igAccessToken}
                  onChange={e => setIgAccessToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Configure via Facebook Developers e obtenha o token de acesso
                  da conta.
                </p>
              </div>
            )}
          </div>
        ),
      },
      // Step 3: Confirmation
      {
        title: 'Confirmação',
        description: 'Verificando e conectando sua conta',
        icon: (
          <div className="flex items-center justify-center">
            {createState === 'success' ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : createState === 'error' ? (
              <XCircle className="h-16 w-16 text-rose-500" />
            ) : (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
          </div>
        ),
        isValid: false,
        onBack: createState === 'error' ? () => setCurrentStep(2) : undefined,
        content: (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {createState === 'idle' && (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Pronto para conectar sua conta?
                </p>
                <Button onClick={handleCreate}>Conectar Agora</Button>
              </div>
            )}

            {createState === 'creating' && (
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm font-medium">Conectando conta...</p>
                <p className="text-xs text-muted-foreground">
                  Isso pode levar alguns segundos
                </p>
              </div>
            )}

            {createState === 'success' && (
              <div className="text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Conta conectada com sucesso!
                </p>
                <p className="text-xs text-muted-foreground">
                  Suas mensagens começarão a aparecer em instantes.
                </p>
                <Button onClick={handleClose} className="mt-2">
                  Concluir
                </Button>
              </div>
            )}

            {createState === 'error' && (
              <div className="text-center space-y-3">
                <XCircle className="h-10 w-10 text-rose-500 mx-auto" />
                <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
                  Falha na conexão
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {createError || 'Verifique as credenciais e tente novamente.'}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreateState('idle');
                      setCurrentStep(2);
                    }}
                  >
                    Verificar Dados
                  </Button>
                  <Button
                    onClick={() => {
                      setCreateState('idle');
                      handleCreate();
                    }}
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            )}
          </div>
        ),
        footer:
          createState === 'success' ? (
            <Button onClick={handleClose}>Concluir</Button>
          ) : createState === 'idle' ? (
            <Button onClick={handleCreate}>Conectar Agora</Button>
          ) : createState === 'creating' ? (
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processando...
            </Button>
          ) : (
            <></>
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedChannel,
      accountName,
      phoneNumber,
      tgBotToken,
      igAccessToken,
      step1Valid,
      step2Valid,
      createState,
      createError,
    ]
  );

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MessagingAccountsPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { data: accountsData, isLoading } = useMessagingAccounts();
  const deleteMutation = useDeleteMessagingAccount();

  const accounts = accountsData?.accounts;

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Action Bar */}
      <PageActionBar
        breadcrumbItems={[
          { label: 'Mensagens', href: '/messaging' },
          { label: 'Contas', href: '/messaging/accounts' },
        ]}
        buttons={[
          {
            id: 'connect',
            title: 'Conectar Conta',
            icon: Plus,
            variant: 'default' as const,
            onClick: () => setWizardOpen(true),
          },
        ]}
      />

      {/* Hero Banner */}
      <Card className="relative overflow-hidden p-6 md:p-8 bg-white dark:bg-white/5 border-gray-200/80 dark:border-white/10 shadow-sm dark:shadow-none shrink-0">
        <div className="absolute top-0 right-0 w-56 h-56 bg-green-500/15 dark:bg-green-500/10 rounded-full opacity-80 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-500/15 dark:bg-sky-500/10 rounded-full opacity-80 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-linear-to-br from-green-500 to-emerald-600">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Contas de Mensageria
              </h1>
              <p className="text-sm text-slate-500 dark:text-white/60">
                Gerencie suas contas conectadas de WhatsApp, Instagram e
                Telegram
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Account List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <Card className="bg-white dark:bg-white/5 border-gray-200/80 dark:border-white/10 shadow-sm dark:shadow-none p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
              <MessageCircle className="size-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              Nenhuma conta conectada
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Conecte sua primeira conta de mensageria para começar a atender
              seus clientes diretamente pelo sistema.
            </p>
            <Button className="mt-4" onClick={() => setWizardOpen(true)}>
              <Plus className="size-4 mr-2" />
              Conectar Conta
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Wizard */}
      <ConnectAccountWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
