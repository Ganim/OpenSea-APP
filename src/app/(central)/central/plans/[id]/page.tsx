'use client';

import { GlassBadge, GlassButton, GlassCard } from '@/components/central';
import { Input } from '@/components/ui/input';
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
  const { data, isLoading } = useAdminPlan(id);
  const updatePlan = useUpdatePlan();
  const setModules = useSetPlanModules();
  const deletePlan = useDeletePlan();

  const [form, setForm] = useState({
    name: '',
    tier: 'FREE',
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
        tier: data.plan.tier,
        description: data.plan.description ?? '',
        price: data.plan.price,
        isActive: data.plan.isActive,
        maxUsers: data.plan.maxUsers,
        maxWarehouses: data.plan.maxWarehouses,
        maxProducts: data.plan.maxProducts,
      });
      setSelectedModules(data.modules.map(m => m.module));
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

  if (!data) {
    return (
      <GlassCard className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/60">Plano não encontrado</p>
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
            <h1 className="text-4xl font-bold text-white">Editar Plano</h1>
            <p className="text-white/60 text-lg mt-1">{form.name}</p>
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
        <GlassCard variant="gradient" className="p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-xl bg-linear-to-br ${tierColors[form.tier as keyof typeof tierColors]}`}
            >
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Informações</h2>
              <p className="text-white/60 text-sm">Dados do plano</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90">
                  Nome do Plano
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white/90">
                  Preço Mensal (R$)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={e =>
                    setForm(f => ({ ...f, price: Number(e.target.value) }))
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier" className="text-white/90">
                Tier
              </Label>
              <Select
                value={form.tier}
                onValueChange={v => setForm(f => ({ ...f, tier: v }))}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
              <Label htmlFor="description" className="text-white/90">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e =>
                  setForm(f => ({ ...f, description: e.target.value }))
                }
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <Switch
                checked={form.isActive}
                onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
              />
              <div>
                <Label className="text-white/90 cursor-pointer">
                  Plano Ativo
                </Label>
                <p className="text-xs text-white/60">
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
              <p className="text-white/70 text-sm">Valor Mensal</p>
              <p className="text-3xl font-bold text-white mt-1">
                R$ {form.price.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/70 text-xs">Status</p>
              <div className="flex items-center gap-2 mt-2">
                {form.isActive ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <p className="text-white font-medium text-sm">Ativo</p>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <p className="text-white font-medium text-sm">Inativo</p>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/70 text-xs">Tier</p>
              <p className="text-white font-bold mt-2">{form.tier}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Limites e Módulos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Limites */}
        <GlassCard variant="gradient" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-linear-to-br from-cyan-500/20 to-cyan-600/20">
              <Package className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Limites</h3>
              <p className="text-white/60 text-sm">Restrições do plano</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUsers" className="text-white/90">
                Máximo de Usuários
              </Label>
              <Input
                id="maxUsers"
                type="number"
                value={form.maxUsers}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    maxUsers: Number(e.target.value),
                  }))
                }
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <p className="text-xs text-white/50">999999 para ilimitado</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWarehouses" className="text-white/90">
                Máximo de Armazéns
              </Label>
              <Input
                id="maxWarehouses"
                type="number"
                value={form.maxWarehouses}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    maxWarehouses: Number(e.target.value),
                  }))
                }
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxProducts" className="text-white/90">
                Máximo de Produtos
              </Label>
              <Input
                id="maxProducts"
                type="number"
                value={form.maxProducts}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    maxProducts: Number(e.target.value),
                  }))
                }
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <Users className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-white/60">Usuários</p>
              <p className="text-sm font-bold text-white">
                {form.maxUsers >= 999999 ? '∞' : form.maxUsers}
              </p>
            </div>
            <div className="text-center">
              <Warehouse className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-white/60">Armazéns</p>
              <p className="text-sm font-bold text-white">
                {form.maxWarehouses >= 999999 ? '∞' : form.maxWarehouses}
              </p>
            </div>
            <div className="text-center">
              <Package className="h-5 w-5 text-pink-400 mx-auto mb-1" />
              <p className="text-xs text-white/60">Produtos</p>
              <p className="text-sm font-bold text-white">
                {form.maxProducts >= 999999 ? '∞' : form.maxProducts}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Módulos */}
        <GlassCard variant="gradient" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-linear-to-br from-amber-500/20 to-amber-600/20">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Módulos</h3>
              <p className="text-white/60 text-sm">
                {selectedModules.length}/{ALL_MODULES.length} ativados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ALL_MODULES.map(mod => (
              <div
                key={mod}
                onClick={() => toggleModule(mod)}
                className="cursor-pointer p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    id={mod}
                    checked={selectedModules.includes(mod)}
                    onChange={() => {}}
                    className="sr-only"
                  />
                  <div className="w-5 h-5 rounded border border-white/30 bg-white/5 flex items-center justify-center">
                    {selectedModules.includes(mod) && (
                      <Check className="h-3 w-3 text-green-400" />
                    )}
                  </div>
                </div>
                <Label
                  htmlFor={mod}
                  className="text-white/90 cursor-pointer text-sm"
                >
                  {mod}
                </Label>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
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
