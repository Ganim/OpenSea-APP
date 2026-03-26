/**
 * OpenSea OS - Edit Goal Page
 * Follows the standard edit page pattern: PageLayout > PageHeader > PageBody
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useGoalProgress,
  useUpdateGoal,
  useDeleteGoal,
} from '@/hooks/sales/use-analytics';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Loader2,
  Save,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// SECTION HEADER
// ============================================================================

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

// ============================================================================
// PAGE
// ============================================================================

export default function EditGoalPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;

  const { data: progressData, isLoading, error } = useGoalProgress(goalId);
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();

  const goal = progressData?.goal;

  // Form state
  const [name, setName] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Populate form when data loads
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetValue(String(goal.targetValue));
      setStartDate(goal.startDate.split('T')[0]);
      setEndDate(goal.endDate.split('T')[0]);
    }
  }, [goal]);

  const breadcrumbItems = [
    { label: 'Vendas', href: '/sales' },
    { label: 'Metas', href: '/sales/analytics/goals' },
    { label: goal?.name || '...', href: `/sales/analytics/goals/${goalId}` },
    { label: 'Editar' },
  ];

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: goalId,
        data: {
          name: name.trim(),
          targetValue: Number(targetValue),
          startDate: new Date(startDate + 'T00:00:00').toISOString(),
          endDate: new Date(endDate + 'T23:59:59').toISOString(),
        },
      });
      toast.success('Meta atualizada com sucesso!');
      router.push(`/sales/analytics/goals/${goalId}`);
    } catch {
      toast.error('Erro ao atualizar meta.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(goalId);
      toast.success('Meta excluída com sucesso!');
      router.push('/sales/analytics/goals');
    } catch {
      toast.error('Erro ao excluir meta.');
    }
  };

  const actionButtons: HeaderButton[] = [
    {
      id: 'delete',
      title: 'Excluir',
      icon: Trash2,
      onClick: () => setDeleteModalOpen(true),
      variant: 'destructive',
    },
    {
      id: 'save',
      title: 'Salvar',
      icon: updateMutation.isPending ? Loader2 : Save,
      onClick: handleSave,
      variant: 'default',
    },
  ];

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

  if (error || !goal) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Meta não encontrada"
            message="A meta que você está procurando não existe ou foi removida."
            action={{
              label: 'Voltar para Metas',
              onClick: () => router.push('/sales/analytics/goals'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

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
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg bg-linear-to-br from-sky-500 to-blue-600">
              <Target className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Editando Meta</p>
              <h1 className="text-xl font-bold truncate">{goal.name}</h1>
              <p className="text-sm text-muted-foreground">
                Criada em{' '}
                {new Date(goal.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-6">
            <SectionHeader
              icon={Target}
              title="Dados da Meta"
              subtitle="Altere as informações da meta"
            />

            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  placeholder="Nome da meta"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Valor Alvo *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Valor alvo"
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data de Início *</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Término *</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Delete Modal */}
        <VerifyActionPinModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={handleDeleteConfirm}
          title="Confirmar Exclusão"
          description={`Digite seu PIN de ação para excluir a meta "${goal.name}". Esta ação não pode ser desfeita.`}
        />
      </PageBody>
    </PageLayout>
  );
}
