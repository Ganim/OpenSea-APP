'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
];
const TIERS = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/central/plans">
          <Button variant="ghost" size="icon" aria-label="Voltar para planos">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Novo Plano</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Informacoes</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="tier">Tier</Label>
              <Select
                value={form.tier}
                onValueChange={v =>
                  setForm(f => ({ ...f, tier: v as PlanTier }))
                }
              >
                <SelectTrigger>
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
            <div>
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e =>
                  setForm(f => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="price">Preco (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={e =>
                  setForm(f => ({ ...f, price: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
              />
              <Label>Ativo</Label>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Limites</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxUsers">Max Usuarios</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={form.maxUsers}
                  onChange={e =>
                    setForm(f => ({ ...f, maxUsers: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="maxWarehouses">Max Armazens</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="maxProducts">Max Produtos</Label>
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
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Modulos</h2>
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
                            <Label
                              htmlFor={`new-${mod}`}
                              className="cursor-not-allowed flex items-center gap-2"
                            >
                              {mod}
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            </Label>
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
                      <Label htmlFor={`new-${mod}`} className="cursor-pointer">
                        {mod}
                      </Label>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleCreate}
          disabled={createPlan.isPending || !form.name}
          className="gap-2"
        >
          <Save className="h-4 w-4" /> Criar Plano
        </Button>
      </div>
    </div>
  );
}
