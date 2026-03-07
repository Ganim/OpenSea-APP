/**
 * Edit Receivable Entry Page
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useBankAccounts,
  useCostCenters,
  useFinanceCategories,
  useFinanceEntry,
  useUpdateFinanceEntry,
} from '@/hooks/finance';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function EditReceivablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useFinanceEntry(id);
  const updateMutation = useUpdateFinanceEntry();
  const entry = data?.entry;

  const { data: categoriesData } = useFinanceCategories({ type: 'REVENUE' });
  const { data: costCentersData } = useCostCenters();
  const { data: bankAccountsData } = useBankAccounts();
  const categories = categoriesData?.categories ?? [];
  const costCenters = costCentersData?.costCenters ?? [];
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];

  const [formData, setFormData] = useState({
    description: '',
    categoryId: '',
    costCenterId: '',
    bankAccountId: '',
    expectedAmount: 0,
    discount: 0,
    interest: 0,
    penalty: 0,
    dueDate: '',
    customerName: '',
    notes: '',
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        description: entry.description,
        categoryId: entry.categoryId,
        costCenterId: entry.costCenterId,
        bankAccountId: entry.bankAccountId || '',
        expectedAmount: entry.expectedAmount,
        discount: entry.discount || 0,
        interest: entry.interest || 0,
        penalty: entry.penalty || 0,
        dueDate: entry.dueDate ? entry.dueDate.split('T')[0] : '',
        customerName: entry.customerName || '',
        notes: entry.notes || '',
      });
    }
  }, [entry]);

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

  if (!entry) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Lançamento não encontrado.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          description: formData.description,
          categoryId: formData.categoryId,
          costCenterId: formData.costCenterId,
          bankAccountId: formData.bankAccountId || undefined,
          expectedAmount: formData.expectedAmount,
          discount: formData.discount,
          interest: formData.interest,
          penalty: formData.penalty,
          dueDate: formData.dueDate,
          customerName: formData.customerName || undefined,
          notes: formData.notes || undefined,
        },
      });
      router.push(`/finance/receivable/${id}`);
    } catch {
      alert('Erro ao atualizar lançamento');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/finance/receivable/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Conta a Receber</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                required
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="categoryId">Categoria *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={value =>
                  setFormData({ ...formData, categoryId: value })
                }
                required
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="costCenterId">Centro de Custo *</Label>
              <Select
                value={formData.costCenterId}
                onValueChange={value =>
                  setFormData({ ...formData, costCenterId: value })
                }
                required
              >
                <SelectTrigger id="costCenterId">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map(cc => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bankAccountId">Conta Bancária</Label>
              <Select
                value={formData.bankAccountId}
                onValueChange={value =>
                  setFormData({ ...formData, bankAccountId: value })
                }
              >
                <SelectTrigger id="bankAccountId">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(ba => (
                    <SelectItem key={ba.id} value={ba.id}>
                      {ba.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customerName">Cliente</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={e =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="expectedAmount">Valor Esperado (R$) *</Label>
              <Input
                id="expectedAmount"
                type="number"
                step="0.01"
                required
                value={formData.expectedAmount}
                onChange={e =>
                  setFormData({
                    ...formData,
                    expectedAmount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                required
                value={formData.dueDate}
                onChange={e =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="discount">Desconto (R$)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={e =>
                  setFormData({
                    ...formData,
                    discount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="interest">Juros (R$)</Label>
              <Input
                id="interest"
                type="number"
                step="0.01"
                value={formData.interest}
                onChange={e =>
                  setFormData({
                    ...formData,
                    interest: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="penalty">Multa (R$)</Label>
              <Input
                id="penalty"
                type="number"
                step="0.01"
                value={formData.penalty}
                onChange={e =>
                  setFormData({
                    ...formData,
                    penalty: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Link href={`/finance/receivable/${id}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
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
