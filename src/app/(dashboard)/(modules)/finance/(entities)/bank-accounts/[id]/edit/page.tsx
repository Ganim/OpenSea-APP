/**
 * Edit Bank Account Page
 * Follows pattern: PageLayout > PageActionBar (Delete + Save) > Identity Card > Section Cards
 */

'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Card } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PermissionCodes from '@/config/rbac/permission-codes';
import {
  useBankAccount,
  useDeleteBankAccount,
  useUpdateBankAccount,
} from '@/hooks/finance';
import { useChartOfAccounts } from '@/hooks/finance/use-chart-of-accounts';
import { usePermissions } from '@/hooks/use-permissions';
import {
  BANK_ACCOUNT_STATUS_LABELS,
  BANK_ACCOUNT_TYPE_LABELS,
  PIX_KEY_TYPE_LABELS,
} from '@/types/finance';
import type {
  BankAccountStatus,
  BankAccountType,
  PixKeyType,
} from '@/types/finance';
import {
  BookOpen,
  Building2,
  CreditCard,
  Loader2,
  QrCode,
  Save,
  Settings,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GridError } from '@/components/handlers/grid-error';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { translateError } from '@/lib/error-messages';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { logger } from '@/lib/logger';

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-foreground" />
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="border-b border-border" />
    </div>
  );
}

// =============================================================================
// PAGE
// =============================================================================

export default function EditBankAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  const { data, isLoading } = useBankAccount(id);
  const updateMutation = useUpdateBankAccount();
  const deleteMutation = useDeleteBankAccount();
  const { hasPermission } = usePermissions();
  const canDelete = hasPermission(PermissionCodes.FINANCE.BANK_ACCOUNTS.REMOVE);
  const account = data?.bankAccount;

  // Chart of accounts: bank accounts are ASSET type
  const { data: chartOfAccountsData } = useChartOfAccounts({
    isActive: true,
    type: 'ASSET',
  });

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    bankCode: '',
    bankName: '',
    agency: '',
    agencyDigit: '',
    accountNumber: '',
    accountDigit: '',
    accountType: 'CHECKING' as BankAccountType,
    status: 'ACTIVE' as BankAccountStatus,
    pixKeyType: '' as string,
    pixKey: '',
    color: '',
    isDefault: false,
    chartOfAccountId: '',
  });

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        bankCode: account.bankCode,
        bankName: account.bankName || '',
        agency: account.agency,
        agencyDigit: account.agencyDigit || '',
        accountNumber: account.accountNumber,
        accountDigit: account.accountDigit || '',
        accountType: account.accountType,
        status: account.status,
        pixKeyType: account.pixKeyType || '',
        pixKey: account.pixKey || '',
        color: account.color || '',
        isDefault: account.isDefault,
        chartOfAccountId: account.chartOfAccountId || '',
      });
    }
  }, [account]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('O nome é obrigatório.');
      return;
    }
    if (!formData.bankCode.trim()) {
      toast.error('O código do banco é obrigatório.');
      return;
    }
    if (!formData.agency.trim()) {
      toast.error('A agência é obrigatória.');
      return;
    }
    if (!formData.accountNumber.trim()) {
      toast.error('O número da conta é obrigatório.');
      return;
    }

    try {
      setIsSaving(true);
      await updateMutation.mutateAsync({
        id,
        data: {
          name: formData.name,
          bankCode: formData.bankCode,
          bankName: formData.bankName || undefined,
          agency: formData.agency,
          agencyDigit: formData.agencyDigit || undefined,
          accountNumber: formData.accountNumber,
          accountDigit: formData.accountDigit || undefined,
          accountType: formData.accountType,
          pixKeyType: (formData.pixKeyType as PixKeyType) || undefined,
          pixKey: formData.pixKey || undefined,
          color: formData.color || undefined,
          isDefault: formData.isDefault,
          chartOfAccountId: formData.chartOfAccountId || null,
        },
      });
      toast.success('Conta bancária atualizada com sucesso!');
      router.push(`/finance/bank-accounts/${id}`);
    } catch (err) {
      logger.error(
        'Erro ao atualizar conta bancária',
        err instanceof Error ? err : undefined
      );
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists') || msg.includes('name already')) {
        setFieldErrors({ name: translateError(msg) });
      } else {
        toast.error(translateError(msg));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Conta bancária excluída com sucesso.');
      router.push('/finance/bank-accounts');
    } catch (err) {
      logger.error(
        'Erro ao excluir conta bancária',
        err instanceof Error ? err : undefined
      );
      toast.error(translateError(err));
    }
  };

  // ==========================================================================
  // ACTION BUTTONS
  // ==========================================================================

  const actionButtons: HeaderButton[] = [
    {
      id: 'cancel',
      title: 'Cancelar',
      onClick: () => router.push(`/finance/bank-accounts/${id}`),
      variant: 'ghost',
    },
    ...(canDelete
      ? [
          {
            id: 'delete',
            title: 'Excluir',
            icon: Trash2,
            onClick: () => setDeleteModalOpen(true),
            variant: 'default' as const,
            className:
              'bg-slate-200 text-slate-700 border-transparent hover:bg-rose-600 hover:text-white dark:bg-[#334155] dark:text-white dark:hover:bg-rose-600',
          },
        ]
      : []),
    {
      id: 'save',
      title: isSaving ? 'Salvando...' : 'Salvar Alterações',
      icon: isSaving ? Loader2 : Save,
      onClick: handleSubmit,
      variant: 'default',
      disabled: isSaving,
    },
  ];

  // ==========================================================================
  // BREADCRUMBS
  // ==========================================================================

  const breadcrumbItems = [
    { label: 'Financeiro', href: '/finance' },
    { label: 'Contas Bancárias', href: '/finance/bank-accounts' },
    {
      label: account?.name || '...',
      href: `/finance/bank-accounts/${id}`,
    },
    { label: 'Editar' },
  ];

  // ==========================================================================
  // LOADING / ERROR
  // ==========================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!account) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Conta bancária não encontrada"
            message="A conta bancária solicitada não foi encontrada."
            action={{
              label: 'Voltar para Contas Bancárias',
              onClick: () => router.push('/finance/bank-accounts'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={breadcrumbItems}
          buttons={actionButtons}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg"
              style={{
                background: account.color
                  ? `linear-gradient(135deg, ${account.color}, ${account.color}cc)`
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              }}
            >
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">
                Editando conta bancária
              </p>
              <h1 className="text-xl font-bold truncate">{account.name}</h1>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0 rounded-lg bg-white/5 px-4 py-2">
              <div className="text-right">
                <p className="text-xs font-semibold">Banco</p>
                <p className="text-[11px] text-muted-foreground">
                  {account.bankName || account.bankCode}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 mb-4">
            <TabsTrigger value="general">Dados Gerais</TabsTrigger>
            <TabsTrigger value="pix">PIX</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab 1: Dados Gerais — Dados Básicos + Dados da Conta */}
          <TabsContent value="general" className="space-y-4">
            {/* Section: Dados Básicos */}
            <Card className="bg-white/5 py-2 overflow-hidden">
              <div className="px-6 py-4 space-y-8">
                <div className="space-y-5">
                  <SectionHeader
                    icon={Building2}
                    title="Dados Básicos"
                    subtitle="Nome, banco e tipo da conta"
                  />
                  <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">
                          Nome <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={e => {
                              setFormData({
                                ...formData,
                                name: e.target.value,
                              });
                              if (fieldErrors.name)
                                setFieldErrors(prev => ({ ...prev, name: '' }));
                            }}
                            placeholder="Nome da conta bancária"
                            aria-invalid={!!fieldErrors.name}
                          />
                          {fieldErrors.name && (
                            <FormErrorIcon message={fieldErrors.name} />
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bankName">Banco</Label>
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              bankName: e.target.value,
                            })
                          }
                          placeholder="Nome do banco"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bankCode">
                          Código do Banco{' '}
                          <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="bankCode"
                          value={formData.bankCode}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              bankCode: e.target.value,
                            })
                          }
                          placeholder="Ex: 001, 341, 237"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="accountType">
                          Tipo de Conta <span className="text-rose-500">*</span>
                        </Label>
                        <Select
                          value={formData.accountType}
                          onValueChange={(value: string) =>
                            setFormData({
                              ...formData,
                              accountType: value as BankAccountType,
                            })
                          }
                        >
                          <SelectTrigger id="accountType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(BANK_ACCOUNT_TYPE_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section: Dados da Conta */}
            <Card className="bg-white/5 py-2 overflow-hidden">
              <div className="px-6 py-4 space-y-8">
                <div className="space-y-5">
                  <SectionHeader
                    icon={CreditCard}
                    title="Dados da Conta"
                    subtitle="Agência e número da conta"
                  />
                  <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="agency">
                          Agência <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="agency"
                          value={formData.agency}
                          onChange={e =>
                            setFormData({ ...formData, agency: e.target.value })
                          }
                          placeholder="0001"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="agencyDigit">Dígito da Agência</Label>
                        <Input
                          id="agencyDigit"
                          value={formData.agencyDigit}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              agencyDigit: e.target.value,
                            })
                          }
                          placeholder="0"
                          maxLength={2}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="accountNumber">
                          Número da Conta{' '}
                          <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="accountNumber"
                          value={formData.accountNumber}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              accountNumber: e.target.value,
                            })
                          }
                          placeholder="12345"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="accountDigit">Dígito da Conta</Label>
                        <Input
                          id="accountDigit"
                          value={formData.accountDigit}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              accountDigit: e.target.value,
                            })
                          }
                          placeholder="0"
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab 2: PIX */}
          <TabsContent value="pix" className="space-y-4">
            <Card className="bg-white/5 py-2 overflow-hidden">
              <div className="px-6 py-4 space-y-8">
                <div className="space-y-5">
                  <SectionHeader
                    icon={QrCode}
                    title="PIX"
                    subtitle="Chave PIX vinculada à conta"
                  />
                  <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="pixKeyType">Tipo de Chave PIX</Label>
                        <Select
                          value={formData.pixKeyType || 'none'}
                          onValueChange={value =>
                            setFormData({
                              ...formData,
                              pixKeyType: value === 'none' ? '' : value,
                            })
                          }
                        >
                          <SelectTrigger id="pixKeyType">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {Object.entries(PIX_KEY_TYPE_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="pixKey">Chave PIX</Label>
                        <Input
                          id="pixKey"
                          value={formData.pixKey}
                          onChange={e =>
                            setFormData({ ...formData, pixKey: e.target.value })
                          }
                          placeholder="Chave PIX"
                          disabled={!formData.pixKeyType}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab 3: Configurações — Status e Configurações + Observações */}
          <TabsContent value="settings" className="space-y-4">
            {/* Section: Status e Configurações */}
            <Card className="bg-white/5 py-2 overflow-hidden">
              <div className="px-6 py-4 space-y-8">
                <div className="space-y-5">
                  <SectionHeader
                    icon={Settings}
                    title="Status e Configurações"
                    subtitle="Status, cor e conta padrão"
                  />
                  <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: string) =>
                            setFormData({
                              ...formData,
                              status: value as BankAccountStatus,
                            })
                          }
                        >
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(BANK_ACCOUNT_STATUS_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="color">Cor</Label>
                        <ColorPicker
                          value={formData.color || '#3b82f6'}
                          onChange={v => setFormData({ ...formData, color: v })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="isDefault">Conta Padrão</Label>
                        <Select
                          value={formData.isDefault ? 'true' : 'false'}
                          onValueChange={value =>
                            setFormData({
                              ...formData,
                              isDefault: value === 'true',
                            })
                          }
                        >
                          <SelectTrigger id="isDefault">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Sim</SelectItem>
                            <SelectItem value="false">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section: Conta Contábil */}
            <Card className="bg-white/5 py-2 overflow-hidden">
              <div className="px-6 py-4 space-y-8">
                <div className="space-y-5">
                  <SectionHeader
                    icon={BookOpen}
                    title="Conta Contábil"
                    subtitle="Vínculo com o plano de contas contábil (tipo Ativo)"
                  />
                  <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="chartOfAccountId">Conta Contábil</Label>
                      <Select
                        value={formData.chartOfAccountId || 'none'}
                        onValueChange={v =>
                          setFormData({
                            ...formData,
                            chartOfAccountId: v === 'none' ? '' : v,
                          })
                        }
                      >
                        <SelectTrigger id="chartOfAccountId">
                          <SelectValue placeholder="Sem vínculo contábil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            Sem vínculo contábil
                          </SelectItem>
                          {(chartOfAccountsData?.chartOfAccounts ?? []).map(
                            acc => (
                              <SelectItem key={acc.id} value={acc.id}>
                                {acc.code} — {acc.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Opcional. Conta de ativo do plano de contas associada a
                        esta conta bancária.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </PageBody>

      {/* Delete PIN Modal */}
      <VerifyActionPinModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteConfirm}
        title="Excluir Conta Bancária"
        description={`Digite seu PIN de ação para excluir a conta bancária "${account.name}". Esta ação não pode ser desfeita.`}
      />
    </PageLayout>
  );
}
