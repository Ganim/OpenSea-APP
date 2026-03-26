'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { FINANCE_PERMISSIONS } from '@/config/rbac/permission-codes';
import { usePermissions } from '@/hooks/use-permissions';
import {
  emailToEntryService,
  financeCategoriesService,
} from '@/services/finance';
import { emailService } from '@/services/email';
import type { UpsertEmailToEntryConfigData } from '@/services/finance/email-to-entry.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2,
  Loader2,
  Mail,
  Play,
  Save,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function FinanceSettingsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canAdmin = hasPermission(FINANCE_PERMISSIONS.ENTRIES.ADMIN);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const configQuery = useQuery({
    queryKey: ['finance', 'email-to-entry', 'config'],
    queryFn: async () => {
      const response = await emailToEntryService.getConfig();
      return response.config;
    },
    enabled: canAdmin,
  });

  const accountsQuery = useQuery({
    queryKey: ['email', 'accounts'],
    queryFn: async () => {
      const response = await emailService.listAccounts();
      return response.data;
    },
    enabled: canAdmin,
  });

  const categoriesQuery = useQuery({
    queryKey: ['finance', 'categories', 'all'],
    queryFn: async () => {
      const response = await financeCategoriesService.list({ isActive: true });
      return response.categories;
    },
    enabled: canAdmin,
  });

  // ============================================================================
  // FORM STATE
  // ============================================================================

  const [form, setForm] = useState<UpsertEmailToEntryConfigData>({
    emailAccountId: '',
    monitoredFolder: 'INBOX/Financeiro',
    isActive: true,
    autoCreate: false,
    defaultType: 'PAYABLE',
    defaultCategoryId: null,
  });

  // Load config into form when data arrives
  useEffect(() => {
    if (configQuery.data) {
      setForm({
        emailAccountId: configQuery.data.emailAccountId,
        monitoredFolder: configQuery.data.monitoredFolder,
        isActive: configQuery.data.isActive,
        autoCreate: configQuery.data.autoCreate,
        defaultType: configQuery.data.defaultType as 'PAYABLE' | 'RECEIVABLE',
        defaultCategoryId: configQuery.data.defaultCategoryId,
      });
    }
  }, [configQuery.data]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const saveMutation = useMutation({
    mutationFn: (data: UpsertEmailToEntryConfigData) =>
      emailToEntryService.upsertConfig(data),
    onSuccess: async () => {
      toast.success('Configuração salva com sucesso');
      await queryClient.invalidateQueries({
        queryKey: ['finance', 'email-to-entry', 'config'],
      });
    },
    onError: () => toast.error('Erro ao salvar configuração'),
  });

  const processMutation = useMutation({
    mutationFn: () => emailToEntryService.processEmails(),
    onSuccess: async (result) => {
      if (result.created > 0) {
        toast.success(
          `${result.created} lançamento(s) criado(s) de ${result.processed} e-mail(s) processado(s)`,
        );
      } else if (result.processed === 0) {
        toast.info('Nenhum e-mail pendente encontrado');
      } else {
        toast.info(
          `${result.processed} e-mail(s) processado(s), nenhum lançamento criado`,
        );
      }
      await queryClient.invalidateQueries({
        queryKey: ['finance', 'email-to-entry', 'config'],
      });
    },
    onError: () => toast.error('Erro ao processar e-mails'),
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSave = () => {
    if (!form.emailAccountId) {
      toast.error('Selecione uma conta de e-mail');
      return;
    }
    saveMutation.mutate(form);
  };

  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const config = configQuery.data;
  const isLoading = configQuery.isLoading || accountsQuery.isLoading;

  if (!canAdmin) {
    return (
      <div className="container max-w-3xl py-6 px-4 space-y-6">
        <PageActionBar
          breadcrumbItems={[
            { label: 'Financeiro', href: '/finance' },
            { label: 'Configurações' },
          ]}
        />
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Sem permissão para acessar as configurações financeiras.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 px-4 space-y-6">
      {/* Action Bar */}
      <PageActionBar
        breadcrumbItems={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'Configurações' },
        ]}
        buttons={[
          {
            id: 'save',
            title: 'Salvar',
            icon: Save,
            variant: 'default',
            onClick: handleSave,
            disabled: saveMutation.isPending,
          },
        ]}
      />

      {/* Email-to-Entry Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
              <Mail className="size-4.5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <CardTitle className="text-base">Email Financeiro</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Importe automaticamente lançamentos a partir de e-mails com
                boletos e notas fiscais em anexo.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-2/3" />
            </div>
          ) : (
            <>
              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Monitoramento ativo</Label>
                  <p className="text-xs text-muted-foreground">
                    Quando ativo, os e-mails da pasta configurada serão processados.
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isActive: checked }))
                  }
                />
              </div>

              <Separator />

              {/* Email Account */}
              <div className="space-y-1.5">
                <Label className="text-sm">Conta de E-mail</Label>
                <Select
                  value={form.emailAccountId}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, emailAccountId: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma conta de e-mail" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <span className="flex items-center gap-2">
                          <Mail className="size-3.5 text-muted-foreground" />
                          {account.displayName
                            ? `${account.displayName} (${account.address})`
                            : account.address}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {accounts.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma conta de e-mail configurada. Configure uma em{' '}
                    <a href="/email/settings" className="text-sky-500 hover:underline">
                      E-mail &gt; Configurações
                    </a>.
                  </p>
                )}
              </div>

              {/* Monitored Folder */}
              <div className="space-y-1.5">
                <Label className="text-sm">Pasta monitorada</Label>
                <Input
                  placeholder="INBOX/Financeiro"
                  value={form.monitoredFolder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, monitoredFolder: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Nome da pasta IMAP a ser monitorada. Apenas e-mails não lidos
                  com anexos PDF/imagem serão processados.
                </p>
              </div>

              <Separator />

              {/* Auto-create toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Criar automaticamente</Label>
                  <p className="text-xs text-muted-foreground">
                    {form.autoCreate
                      ? 'Lançamentos serão criados automaticamente após extração.'
                      : 'Lançamentos serão criados como rascunho para revisão manual.'}
                  </p>
                </div>
                <Switch
                  checked={form.autoCreate}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, autoCreate: checked }))
                  }
                />
              </div>

              {/* Default Type */}
              <div className="space-y-1.5">
                <Label className="text-sm">Tipo padrão</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, defaultType: 'PAYABLE' }))
                    }
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      form.defaultType === 'PAYABLE'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    A Pagar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, defaultType: 'RECEIVABLE' }))
                    }
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      form.defaultType === 'RECEIVABLE'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    A Receber
                  </button>
                </div>
              </div>

              {/* Default Category */}
              <div className="space-y-1.5">
                <Label className="text-sm">Categoria padrão</Label>
                <Select
                  value={form.defaultCategoryId ?? ''}
                  onValueChange={(value) =>
                    setForm((f) => ({
                      ...f,
                      defaultCategoryId: value || null,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Categoria aplicada aos lançamentos criados automaticamente.
                </p>
              </div>

              <Separator />

              {/* Stats & Process */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {config && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 gap-1"
                      >
                        <CheckCircle2 className="size-2.5 text-emerald-500" />
                        {config.processedCount} processado(s)
                      </Badge>
                      {config.lastProcessedAt && (
                        <span>
                          Último:{' '}
                          {format(
                            new Date(config.lastProcessedAt),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR },
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-9 px-2.5"
                  onClick={() => processMutation.mutate()}
                  disabled={
                    processMutation.isPending || !form.emailAccountId || !form.isActive
                  }
                >
                  {processMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                  Processar Agora
                </Button>
              </div>

              {/* Process Results */}
              {processMutation.data && processMutation.data.processed > 0 && (
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-medium">
                    Resultado do processamento
                  </p>
                  <div className="flex gap-3 text-xs">
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300"
                    >
                      {processMutation.data.created} criado(s)
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-sky-50 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300"
                    >
                      {processMutation.data.skipped} ignorado(s)
                    </Badge>
                    {processMutation.data.failed > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300"
                      >
                        {processMutation.data.failed} erro(s)
                      </Badge>
                    )}
                  </div>
                  {processMutation.data.entries.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {processMutation.data.entries.slice(0, 10).map((e, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-4 px-1 ${
                              e.status === 'created' || e.status === 'draft'
                                ? 'text-emerald-600'
                                : e.status === 'failed'
                                  ? 'text-rose-600'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {e.status === 'created'
                              ? 'Criado'
                              : e.status === 'draft'
                                ? 'Rascunho'
                                : e.status === 'failed'
                                  ? 'Erro'
                                  : 'Ignorado'}
                          </Badge>
                          <span className="truncate flex-1">{e.subject}</span>
                          {e.error && (
                            <span className="text-rose-500 text-[10px]">
                              {e.error}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
