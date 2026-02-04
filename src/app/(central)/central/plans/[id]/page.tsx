'use client';

import { GlassBadge, GlassButton, GlassCard } from '@/components/central';
import { GlassInput } from '@/components/central/glass-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdminPlan,
  useDeletePlan,
  useSetPlanModules,
  useUpdatePlan,
} from '@/hooks/admin/use-admin';
import { cn } from '@/lib/utils';
import { PlanTier } from '@/types/enums';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CreditCard,
  Package,
  Save,
  Trash2,
  Users,
  Warehouse,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ALL_MODULES = [
  'CORE',
  'STOCK',
  'SALES',
  'HR',
  'PAYROLL',
  'REPORTS',
  'AUDIT',
  'REQUESTS',
  'NOTIFICATIONS',
];
const TIERS = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];

export default function EditPlanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, error } = useAdminPlan(id);
  const updatePlan = useUpdatePlan();
  const setModules = useSetPlanModules();
  const deletePlan = useDeletePlan();

  const [form, setForm] = useState<{
    name: string;
    tier: PlanTier;
    description: string;
    price: number;
    isActive: boolean;
    maxUsers: number;
    maxWarehouses: number;
    maxProducts: number;
  }>({
    name: '',
    tier: PlanTier.FREE,
    description: '',
    price: 0,
    isActive: true,
    maxUsers: 5,
    maxWarehouses: 1,
    maxProducts: 100,
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  useEffect(() => {
    if (data?.plan) {
      setForm({
        name: data.plan.name,
        tier: data.plan.tier as PlanTier,
        description: data.plan.description ?? '',
        price: data.plan.price,
        isActive: data.plan.isActive,
        maxUsers: data.plan.maxUsers,
        maxWarehouses: data.plan.maxWarehouses,
        maxProducts: data.plan.maxProducts,
      });
      setSelectedModules(
        data.modules.map((m: Record<string, unknown>) => m.module as string)
      );
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updatePlan.mutateAsync({ id, data: form });
      await setModules.mutateAsync({ id, modules: selectedModules });
      toast.success('Plano atualizado com sucesso');
    } catch {
      toast.error('Erro ao atualizar plano');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja realmente desativar este plano?')) return;
    try {
      await deletePlan.mutateAsync(id);
      toast.success('Plano desativado com sucesso');
      router.push('/central/plans');
    } catch {
      toast.error('Erro ao desativar plano');
    }
  };

  const toggleModule = (mod: string) => {
    setSelectedModules(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <GlassCard className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 central-text-subtle" />
        <p className="central-text-muted">
          {error instanceof Error ? error.message : 'Plano não encontrado'}
        </p>
        <Link href="/central/plans" className="mt-4 inline-block">
          <GlassButton variant="secondary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para lista
          </GlassButton>
        </Link>
      </GlassCard>
    );
  }

  const tierColors = {
    FREE: 'from-gray-500/20 to-gray-600/20 text-gray-400',
    STARTER: 'from-blue-500/20 to-blue-600/20 text-blue-400',
    PROFESSIONAL: 'from-purple-500/20 to-purple-600/20 text-purple-400',
    ENTERPRISE: 'from-amber-500/20 to-amber-600/20 text-amber-400',
  } as const;

  const tierBadgeColor = {
    FREE: 'default',
    STARTER: 'info',
    PROFESSIONAL: 'success',
    ENTERPRISE: 'warning',
  } as const;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/central/plans">
            <GlassButton variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </GlassButton>
          </Link>
          <div>
            <h1 className="text-4xl font-bold central-text">Editar Plano</h1>
            <p className="central-text-muted text-lg mt-1">{form.name}</p>
          </div>
        </div>
        <GlassBadge
          variant={tierBadgeColor[form.tier as keyof typeof tierBadgeColor]}
        >
          {form.tier}
        </GlassBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informações Principais */}
        <GlassCard
          variant="gradient"
          className="p-6 lg:col-span-2 central-accent-blue"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-xl bg-linear-to-br ${tierColors[form.tier as keyof typeof tierColors]}`}
            >
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold central-text">Informações</h2>
              <p className="central-text-muted text-sm">Dados do plano</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="central-text">
                  Nome do Plano
                </Label>
                <GlassInput
                  id="name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="central-text">
                  Preço Mensal (R$)
                </Label>
                <GlassInput
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={e =>
                    setForm(f => ({ ...f, price: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier" className="central-text">
                Tier
              </Label>
              <Select
                value={form.tier}
                onValueChange={v =>
                  setForm(f => ({ ...f, tier: v as PlanTier }))
                }
              >
                <SelectTrigger className="central-glass central-text border-[rgb(var(--glass-border)/var(--glass-border-opacity))]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map(t => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="central-text">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e =>
                  setForm(f => ({ ...f, description: e.target.value }))
                }
                className="central-glass central-text border-[rgb(var(--glass-border)/var(--glass-border-opacity))] placeholder:central-text-subtle"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg central-glass-subtle">
              <Switch
                checked={form.isActive}
                onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
              />
              <div>
                <Label className="central-text cursor-pointer">
                  Plano Ativo
                </Label>
                <p className="text-xs central-text-muted">
                  {form.isActive
                    ? 'Disponível para contratação'
                    : 'Oculto de clientes'}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Card de Resumo */}
        <GlassCard className="p-6 h-fit">
          <div className="space-y-4">
            <div>
              <p className="central-text-muted text-sm">Valor Mensal</p>
              <p className="text-3xl font-bold central-text mt-1">
                R$ {form.price.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg central-glass-subtle">
              <p className="central-text-muted text-xs">Status</p>
              <div className="flex items-center gap-2 mt-2">
                {form.isActive ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-success))]" />
                    <p className="central-text font-medium text-sm">Ativo</p>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-destructive))]" />
                    <p className="central-text font-medium text-sm">Inativo</p>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg central-glass-subtle">
              <p className="central-text-muted text-xs">Tier</p>
              <p className="central-text font-bold mt-2">{form.tier}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Limites e Módulos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Limites */}
        <GlassCard variant="gradient" className="p-6 central-accent-cyan">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl central-accent-gradient">
              <Package className="h-5 w-5 central-accent-text" />
            </div>
            <div>
              <h3 className="text-lg font-bold central-text">Limites</h3>
              <p className="central-text-muted text-sm">Restrições do plano</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUsers" className="central-text">
                Máximo de Usuários
              </Label>
              <GlassInput
                id="maxUsers"
                type="number"
                value={form.maxUsers}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    maxUsers: Number(e.target.value),
                  }))
                }
              />
              <p className="text-xs central-text-subtle">
                999999 para ilimitado
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWarehouses" className="central-text">
                Máximo de Armazéns
              </Label>
              <GlassInput
                id="maxWarehouses"
                type="number"
                value={form.maxWarehouses}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    maxWarehouses: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxProducts" className="central-text">
                Máximo de Produtos
              </Label>
              <GlassInput
                id="maxProducts"
                type="number"
                value={form.maxProducts}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    maxProducts: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t central-divider">
            <div className="text-center">
              <Users className="h-5 w-5 text-[rgb(var(--os-blue-500))] mx-auto mb-1" />
              <p className="text-xs central-text-muted">Usuários</p>
              <p className="text-sm font-bold central-text">
                {form.maxUsers >= 999999 ? '∞' : form.maxUsers}
              </p>
            </div>
            <div className="text-center">
              <Warehouse className="h-5 w-5 text-[rgb(var(--os-purple-500))] mx-auto mb-1" />
              <p className="text-xs central-text-muted">Armazéns</p>
              <p className="text-sm font-bold central-text">
                {form.maxWarehouses >= 999999 ? '∞' : form.maxWarehouses}
              </p>
            </div>
            <div className="text-center">
              <Package className="h-5 w-5 text-[rgb(var(--os-pink-500))] mx-auto mb-1" />
              <p className="text-xs central-text-muted">Produtos</p>
              <p className="text-sm font-bold central-text">
                {form.maxProducts >= 999999 ? '∞' : form.maxProducts}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Módulos */}
        <GlassCard variant="gradient" className="p-6 central-accent-amber">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl central-accent-gradient">
              <Zap className="h-5 w-5 central-accent-text" />
            </div>
            <div>
              <h3 className="text-lg font-bold central-text">Módulos</h3>
              <p className="central-text-muted text-sm">
                {selectedModules.length}/{ALL_MODULES.length} ativados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ALL_MODULES.map(mod => (
              <div
                key={mod}
                onClick={() => toggleModule(mod)}
                className={cn(
                  'p-3 rounded-lg flex items-center gap-3 transition-all cursor-pointer central-glass-subtle hover:central-glass'
                )}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    id={mod}
                    checked={selectedModules.includes(mod)}
                    onChange={() => toggleModule(mod)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center central-glass-subtle',
                      selectedModules.includes(mod) &&
                        'bg-[rgb(var(--color-success)/0.2)] border-[rgb(var(--color-success))]'
                    )}
                  >
                    {selectedModules.includes(mod) && (
                      <Check className="h-3 w-3 text-[rgb(var(--color-success))]" />
                    )}
                  </div>
                </div>
                <Label
                  htmlFor={mod}
                  className="text-sm cursor-pointer central-text"
                >
                  {mod}
                </Label>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4 border-t central-divider">
        <GlassButton variant="danger" onClick={handleDelete} className="gap-2">
          <Trash2 className="h-4 w-4" />
          Desativar Plano
        </GlassButton>
        <GlassButton
          onClick={handleSave}
          disabled={updatePlan.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Salvar Alterações
        </GlassButton>
      </div>
    </div>
  );
}
