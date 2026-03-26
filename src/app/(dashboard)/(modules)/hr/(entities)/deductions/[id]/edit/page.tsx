/**
 * OpenSea OS - Deduction Edit Page
 * Follows pattern: PageLayout > PageActionBar (Delete + Save) > Identity Card > Section Cards
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Card } from '@/components/ui/card';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useEmployeeMap } from '@/hooks/use-employee-map';
import { deductionsService } from '@/services/hr/deductions.service';
import { translateError } from '@/lib/error-messages';
import { logger } from '@/lib/logger';
import type { Deduction } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  MinusCircle,
  NotebookText,
  Receipt,
  Save,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  deductionKeys,
  formatCurrency,
  useDeleteDeduction,
  useUpdateDeduction,
} from '../../src';

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

export default function DeductionEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deductionId = params.id as string;

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    reason: '',
    date: '',
    isRecurring: false,
    installments: '',
  });

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  const { data: deduction, isLoading } = useQuery<Deduction>({
    queryKey: deductionKeys.detail(deductionId),
    queryFn: async () => {
      const response = await deductionsService.get(deductionId);
      return response.deduction;
    },
  });

  const { getName } = useEmployeeMap(
    deduction ? [deduction.employeeId] : []
  );

  // ==========================================================================
  // MUTATIONS
  // ==========================================================================

  const updateMutation = useUpdateDeduction();
  const deleteMutation = useDeleteDeduction({
    onSuccess: () => {
      router.push('/hr/deductions');
    },
  });

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    if (deduction) {
      setFormData({
        name: deduction.name,
        amount: String(deduction.amount),
        reason: deduction.reason || '',
        date: deduction.date ? deduction.date.slice(0, 10) : '',
        isRecurring: deduction.isRecurring,
        installments: deduction.installments
          ? String(deduction.installments)
          : '',
      });
    }
  }, [deduction]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setFieldErrors({ name: 'O nome é obrigatório.' });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setFieldErrors({ amount: 'O valor deve ser maior que zero.' });
      return;
    }

    const installments = formData.installments
      ? parseInt(formData.installments)
      : null;
    if (!formData.isRecurring && installments !== null && installments > 0) {
      // installments only valid when not recurring (parcelado)
    }

    try {
      setIsSaving(true);
      await updateMutation.mutateAsync({
        id: deductionId,
        data: {
          name: formData.name,
          amount,
          reason: formData.reason || undefined,
          date: formData.date || undefined,
          isRecurring: formData.isRecurring,
          installments: !formData.isRecurring && installments
            ? installments
            : null,
        },
      });
      await queryClient.invalidateQueries({
        queryKey: deductionKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: deductionKeys.detail(deductionId),
      });
      toast.success('Dedução atualizada com sucesso!');
      router.push(`/hr/deductions/${deductionId}`);
    } catch (err) {
      logger.error(
        'Erro ao atualizar dedução',
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
    if (!deduction) return;
    try {
      await deleteMutation.mutateAsync(deduction.id);
      setDeleteModalOpen(false);
    } catch (err) {
      logger.error(
        'Erro ao excluir dedução',
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
      onClick: () => router.push(`/hr/deductions/${deductionId}`),
      variant: 'ghost',
    },
    {
      id: 'delete',
      title: 'Excluir',
      icon: Trash2,
      onClick: () => setDeleteModalOpen(true),
      variant: 'default' as const,
      className:
        'bg-slate-200 text-slate-700 border-transparent hover:bg-rose-600 hover:text-white dark:bg-[#334155] dark:text-white dark:hover:bg-rose-600',
    },
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
    { label: 'RH', href: '/hr' },
    { label: 'Descontos', href: '/hr/deductions' },
    {
      label: deduction?.name || '...',
      href: `/hr/deductions/${deductionId}`,
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

  if (!deduction) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Dedução não encontrada"
            message="A dedução solicitada não foi encontrada."
            action={{
              label: 'Voltar para Descontos',
              onClick: () => router.push('/hr/deductions'),
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
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-rose-600 shadow-lg">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">
                Editando desconto
              </p>
              <h1 className="text-xl font-bold truncate">{deduction.name}</h1>
              <p className="text-sm text-muted-foreground">
                {getName(deduction.employeeId)} ·{' '}
                {formatCurrency(deduction.amount)}
              </p>
            </div>
          </div>
        </Card>

        {/* Section: Informações do Desconto */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-8">
            <div className="space-y-5">
              <SectionHeader
                icon={NotebookText}
                title="Informações do Desconto"
                subtitle="Dados principais da dedução"
              />
              <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      Nome <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={e => {
                          setFormData({ ...formData, name: e.target.value });
                          if (fieldErrors.name)
                            setFieldErrors(prev => ({ ...prev, name: '' }));
                        }}
                        placeholder="Nome do desconto"
                        aria-invalid={!!fieldErrors.name}
                      />
                      {fieldErrors.name && (
                        <FormErrorIcon message={fieldErrors.name} />
                      )}
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="grid gap-2">
                    <Label htmlFor="amount">
                      Valor (R$) <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={e => {
                          setFormData({ ...formData, amount: e.target.value });
                          if (fieldErrors.amount)
                            setFieldErrors(prev => ({ ...prev, amount: '' }));
                        }}
                        placeholder="0,00"
                        aria-invalid={!!fieldErrors.amount}
                      />
                      {fieldErrors.amount && (
                        <FormErrorIcon message={fieldErrors.amount} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={e =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Motivo */}
                <div className="grid gap-2">
                  <Label htmlFor="reason">Motivo</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={e =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Descreva o motivo do desconto"
                    rows={4}
                  />
                </div>

                {/* Recorrente */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="isRecurring">Recorrente</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.isRecurring
                        ? 'Desconto aplicado todo mês'
                        : 'Desconto único ou parcelado'}
                    </p>
                  </div>
                  <Switch
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={checked =>
                      setFormData({
                        ...formData,
                        isRecurring: checked,
                        installments: checked ? '' : formData.installments,
                      })
                    }
                  />
                </div>

                {/* Parcelas (only if not recurring) */}
                {!formData.isRecurring && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="grid gap-2">
                      <Label htmlFor="installments">
                        Parcelas
                      </Label>
                      <Input
                        id="installments"
                        type="number"
                        min="1"
                        step="1"
                        value={formData.installments}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            installments: e.target.value,
                          })
                        }
                        placeholder="Número de parcelas (opcional)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para desconto único sem parcelamento.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </PageBody>

      {/* Delete PIN Modal */}
      <VerifyActionPinModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteConfirm}
        title="Excluir Desconto"
        description={`Digite seu PIN de ação para excluir o desconto "${deduction.name}". Esta ação não pode ser desfeita.`}
      />
    </PageLayout>
  );
}
