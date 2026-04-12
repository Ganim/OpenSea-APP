/**
 * OpenSea OS - Benefit Plan Edit Page
 */

'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '../../../../_shared/constants/hr-permissions';
import { logger } from '@/lib/logger';
import type { BenefitPlan, BenefitType } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Loader2, NotebookText, Save, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { benefitPlansApi, deleteBenefitPlan } from '../../src';
import {
  BENEFIT_TYPE_LABELS,
  BENEFIT_TYPE_COLORS,
  BENEFIT_TYPE_OPTIONS,
} from '../../src/utils/benefits.utils';

export default function BenefitPlanEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const planId = params.id as string;
  const { hasPermission } = usePermissions();
  const canDelete = hasPermission(HR_PERMISSIONS.BENEFITS.DELETE);

  // Form states
  const [planName, setPlanName] = useState('');
  const [planType, setPlanType] = useState<BenefitType>('VR');
  const [planProvider, setPlanProvider] = useState('');
  const [planPolicyNumber, setPlanPolicyNumber] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: plan, isLoading } = useQuery<BenefitPlan>({
    queryKey: ['benefit-plans', planId],
    queryFn: async () => {
      return benefitPlansApi.get(planId);
    },
  });

  // Sync states with plan data
  useEffect(() => {
    if (plan) {
      setPlanName(plan.name);
      setPlanType(plan.type);
      setPlanProvider(plan.provider || '');
      setPlanPolicyNumber(plan.policyNumber || '');
      setPlanDescription(plan.description || '');
      setIsActive(plan.isActive);
    }
  }, [plan]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDeleteConfirm = async () => {
    if (!plan) return;
    try {
      await deleteBenefitPlan(plan.id);
      await queryClient.invalidateQueries({ queryKey: ['benefit-plans'] });
      toast.success('Plano de benefício excluído com sucesso!');
      router.push('/hr/benefits');
    } catch (error) {
      logger.error(
        'Erro ao excluir plano',
        error instanceof Error ? error : undefined
      );
      toast.error('Erro ao excluir plano de benefício');
    }
  };

  const handleSave = async () => {
    if (!plan || !planName) return;

    setIsSaving(true);
    try {
      await benefitPlansApi.update(planId, {
        name: planName,
        type: planType,
        provider: planProvider || undefined,
        policyNumber: planPolicyNumber || undefined,
        description: planDescription || undefined,
        isActive,
      });
      await queryClient.invalidateQueries({ queryKey: ['benefit-plans'] });
      toast.success('Plano de benefício atualizado com sucesso!');
      router.push(`/hr/benefits/${planId}`);
    } catch (error) {
      logger.error(
        'Erro ao salvar plano',
        error instanceof Error ? error : undefined
      );
      toast.error('Erro ao salvar plano de benefício');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Benefícios', href: '/hr/benefits' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!plan) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Benefícios', href: '/hr/benefits' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Plano não encontrado
            </h2>
            <Button onClick={() => router.push('/hr/benefits')}>
              Voltar para Benefícios
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  const colors = BENEFIT_TYPE_COLORS[planType] || BENEFIT_TYPE_COLORS.FLEX;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Benefícios', href: '/hr/benefits' },
            {
              label: plan.name,
              href: `/hr/benefits/${planId}`,
            },
            { label: 'Editar' },
          ]}
          buttons={
            [
              {
                id: 'cancel',
                title: 'Cancelar',
                onClick: () => router.push(`/hr/benefits/${planId}`),
                variant: 'ghost',
                disabled: isSaving,
              },
              canDelete && {
                id: 'delete',
                title: 'Excluir',
                icon: Trash2,
                onClick: () => setDeleteModalOpen(true),
                variant: 'default' as const,
                className:
                  'bg-slate-200 text-slate-700 border-transparent hover:bg-rose-600 hover:text-white dark:bg-slate-800 dark:text-white dark:hover:bg-rose-600',
              },
              {
                id: 'save',
                title: isSaving ? 'Salvando...' : 'Salvar Alterações',
                icon: isSaving ? Loader2 : Save,
                onClick: handleSave,
                variant: 'default',
                disabled: isSaving,
              },
            ].filter(Boolean) as HeaderButton[]
          }
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br ${colors.gradient}`}
            >
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">
                Editar Plano de Benefício
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {plan.name} - {BENEFIT_TYPE_LABELS[plan.type]}
              </p>
            </div>
            <Badge variant={plan.isActive ? 'success' : 'secondary'}>
              {plan.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Dados do Plano */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-8">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <NotebookText className="h-5 w-5 text-foreground" />
                  <div>
                    <h3 className="text-base font-semibold">Dados do Plano</h3>
                    <p className="text-sm text-muted-foreground">
                      Informações principais do plano de benefício
                    </p>
                  </div>
                </div>
                <div className="border-b border-border" />
              </div>
              <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nome <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Plano Saúde Básico"
                      value={planName}
                      onChange={e => setPlanName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">
                      Tipo <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={planType}
                      onValueChange={(v: string) =>
                        setPlanType(v as BenefitType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {BENEFIT_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Operadora/Fornecedor</Label>
                    <Input
                      id="provider"
                      placeholder="Ex: Unimed, Alelo"
                      value={planProvider}
                      onChange={e => setPlanProvider(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Número da Apólice</Label>
                    <Input
                      id="policyNumber"
                      placeholder="Número do contrato"
                      value={planPolicyNumber}
                      onChange={e => setPlanPolicyNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Descrição do plano (opcional)"
                    value={planDescription}
                    onChange={e => setPlanDescription(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {isActive ? 'Plano ativo' : 'Plano inativo'}
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
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
        title="Excluir Plano de Benefício"
        description={`Digite seu PIN de ação para excluir o plano "${plan.name}". Esta ação não pode ser desfeita.`}
      />
    </PageLayout>
  );
}
