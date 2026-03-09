'use client';

import { GlassButton } from '@/components/central/glass-button';
import { GlassCard } from '@/components/central/glass-card';
import { GlassInput } from '@/components/central/glass-input';
import {
  GlassSelect,
  GlassSelectContent,
  GlassSelectItem,
  GlassSelectTrigger,
  GlassSelectValue,
} from '@/components/central/glass-select';
import { GlassTextarea } from '@/components/central/glass-textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCreatePlan, useSetPlanModules } from '@/hooks/admin/use-admin';
import { PlanTier } from '@/types/enums';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  'FINANCE',
  'CALENDAR',
  'STORAGE',
  'EMAIL',
  'TASKS',
];

const TIER_OPTIONS = [
  { value: 'FREE', label: 'Free' },
  { value: 'STARTER', label: 'Starter' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
];

export default function NewPlanPage() {
  const router = useRouter();
  const createPlan = useCreatePlan();
  const setModules = useSetPlanModules();

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
  const [selectedModules, setSelectedModules] = useState<string[]>(['CORE']);

  const toggleModule = (mod: string) => {
    setSelectedModules(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const handleCreate = async () => {
    try {
      const result = await createPlan.mutateAsync(form);
      if (selectedModules.length > 0 && result?.id) {
        await setModules.mutateAsync({
          id: result.id,
          modules: selectedModules,
        });
      }
      toast.success('Plano criado com sucesso');
      router.push('/central/plans');
    } catch {
      toast.error('Erro ao criar plano');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href="/central/plans">
          <GlassButton
            variant="ghost"
            size="sm"
            aria-label="Voltar para planos"
          >
            <ArrowLeft className="h-4 w-4" />
          </GlassButton>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight central-text">
            Novo Plano
          </h1>
          <p className="central-text-muted text-sm mt-1">
            Configure o plano com limites e módulos
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6 space-y-5">
          <h2 className="text-lg font-semibold central-text">Informações</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium central-text"
              >
                Nome
              </label>
              <GlassInput
                id="name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nome do plano"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="plan-tier" className="text-sm font-medium central-text">Tier</label>
              <GlassSelect
                value={form.tier}
                onValueChange={v =>
                  setForm(f => ({ ...f, tier: v as PlanTier }))
                }
              >
                <GlassSelectTrigger>
                  <GlassSelectValue />
                </GlassSelectTrigger>
                <GlassSelectContent>
                  {TIER_OPTIONS.map(t => (
                    <GlassSelectItem key={t.value} value={t.value}>
                      {t.label}
                    </GlassSelectItem>
                  ))}
                </GlassSelectContent>
              </GlassSelect>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="text-sm font-medium central-text"
              >
                Descrição
              </label>
              <GlassTextarea
                id="description"
                value={form.description}
                onChange={e =>
                  setForm(f => ({ ...f, description: e.target.value }))
                }
                placeholder="Descreva os benefícios do plano"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="price"
                className="text-sm font-medium central-text"
              >
                Preço (R$)
              </label>
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
            <div className="flex items-center gap-3">
              <Switch
                id="plan-active"
                checked={form.isActive}
                onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
              />
              <label htmlFor="plan-active" className="text-sm font-medium central-text">Ativo</label>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6 space-y-5">
            <h2 className="text-lg font-semibold central-text">Limites</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="maxUsers"
                  className="text-sm font-medium central-text"
                >
                  Máximo de Usuários
                </label>
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
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="maxWarehouses"
                  className="text-sm font-medium central-text"
                >
                  Máximo de Armazéns
                </label>
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
              <div className="space-y-1.5">
                <label
                  htmlFor="maxProducts"
                  className="text-sm font-medium central-text"
                >
                  Máximo de Produtos
                </label>
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
          </GlassCard>

          <GlassCard className="p-6 space-y-5">
            <h2 className="text-lg font-semibold central-text">Módulos</h2>
            <div className="space-y-3">
              {ALL_MODULES.map(mod => (
                <div
                  key={mod}
                  className={`flex items-center gap-3 ${
                    mod === 'NOTIFICATIONS' ? 'opacity-60' : ''
                  }`}
                >
                  {mod === 'NOTIFICATIONS' ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`new-${mod}`}
                              disabled
                              checked={false}
                            />
                            <label
                              htmlFor={`new-${mod}`}
                              className="cursor-not-allowed flex items-center gap-2 text-sm central-text"
                            >
                              {mod}
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            </label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Notificações em breve. Será implementado em uma
                            próxima versão.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <>
                      <Checkbox
                        id={`new-${mod}`}
                        checked={selectedModules.includes(mod)}
                        onCheckedChange={() => toggleModule(mod)}
                      />
                      <label
                        htmlFor={`new-${mod}`}
                        className="cursor-pointer text-sm central-text"
                      >
                        {mod}
                      </label>
                    </>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="flex justify-end">
        <GlassButton
          variant="primary"
          onClick={handleCreate}
          disabled={createPlan.isPending || !form.name}
          isLoading={createPlan.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" /> Criar Plano
        </GlassButton>
      </div>
    </div>
  );
}
