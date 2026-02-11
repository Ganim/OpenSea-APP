/**
 * Edit Cost Center Page
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCostCenter, useUpdateCostCenter } from '@/hooks/finance';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function EditCostCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useCostCenter(id);
  const updateMutation = useUpdateCostCenter();
  const costCenter = data?.costCenter;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true,
    monthlyBudget: 0,
    annualBudget: 0,
  });

  useEffect(() => {
    if (costCenter) {
      setFormData({
        code: costCenter.code,
        name: costCenter.name,
        description: costCenter.description || '',
        isActive: costCenter.isActive,
        monthlyBudget: costCenter.monthlyBudget || 0,
        annualBudget: costCenter.annualBudget || 0,
      });
    }
  }, [costCenter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!costCenter) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Centro de custo não encontrado.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          code: formData.code,
          name: formData.name,
          isActive: formData.isActive,
          description: formData.description || undefined,
          monthlyBudget: formData.monthlyBudget || undefined,
          annualBudget: formData.annualBudget || undefined,
        },
      });
      router.push(`/finance/cost-centers/${id}`);
    } catch {
      alert('Erro ao atualizar centro de custo');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/finance/cost-centers/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Centro de Custo</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="monthlyBudget">Orçamento Mensal (R$)</Label>
              <Input
                id="monthlyBudget"
                type="number"
                step="0.01"
                value={formData.monthlyBudget}
                onChange={e =>
                  setFormData({ ...formData, monthlyBudget: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label htmlFor="annualBudget">Orçamento Anual (R$)</Label>
              <Input
                id="annualBudget"
                type="number"
                step="0.01"
                value={formData.annualBudget}
                onChange={e =>
                  setFormData({ ...formData, annualBudget: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Ativo</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Link href={`/finance/cost-centers/${id}`}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
