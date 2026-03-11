/**
 * Edit Payable Entry Page
 */

'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
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
import { Skeleton } from '@/components/ui/skeleton';
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
import { toast } from 'sonner';

// =============================================================================
// LOADING SKELETON
// =============================================================================

function EditSkeleton() {
  return (
    <PageLayout>
      <PageHeader>
        <div className="h-10" />
      </PageHeader>
      <PageBody>
        <Card className="p-6">
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </Card>
      </PageBody>
    </PageLayout>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EditPayablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useFinanceEntry(id);
  const updateMutation = useUpdateFinanceEntry();
  const entry = data?.entry;

  const { data: categoriesData } = useFinanceCategories({ type: 'EXPENSE' });
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
    supplierName: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      setFormData({
        description: entry.description,
        categoryId: entry.categoryId,
        costCenterId: entry.costCenterId ?? '',
        bankAccountId: entry.bankAccountId || '',
        expectedAmount: entry.expectedAmount,
        discount: entry.discount || 0,
        interest: entry.interest || 0,
        penalty: entry.penalty || 0,
        dueDate: entry.dueDate ? entry.dueDate.split('T')[0] : '',
        supplierName: entry.supplierName || '',
        notes: entry.notes || '',
      });
    }
  }, [entry]);

  if (isLoading) return <EditSkeleton />;

  if (!entry) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Financeiro', href: '/finance' },
              { label: 'Contas a Pagar', href: '/finance/payable' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="p-12 text-center">
            <p className="text-destructive text-lg">
              Lançamento não encontrado.
            </p>
            <Link href="/finance/payable">
              <Button variant="outline" className="mt-4">
                Voltar para contas a pagar
              </Button>
            </Link>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória.';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'A categoria é obrigatória.';
    }

    if (!formData.costCenterId) {
      newErrors.costCenterId = 'O centro de custo é obrigatório.';
    }

    if (!formData.expectedAmount || formData.expectedAmount <= 0) {
      newErrors.expectedAmount = 'O valor deve ser maior que zero.';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'A data de vencimento é obrigatória.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Corrija os campos destacados antes de salvar.');
      return;
    }

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
          supplierName: formData.supplierName || undefined,
          notes: formData.notes || undefined,
        },
      });
      toast.success('Lançamento atualizado com sucesso.');
      router.push(`/finance/payable/${id}`);
    } catch {
      toast.error('Erro ao atualizar lançamento. Tente novamente.');
    }
  };

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Financeiro', href: '/finance' },
            { label: 'Contas a Pagar', href: '/finance/payable' },
            { label: 'Editar' },
          ]}
        />
        <div className="flex items-center gap-4">
          <Link href={`/finance/payable/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Editar Conta a Pagar</h1>
        </div>
      </PageHeader>

      <PageBody>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  required
                  value={formData.description}
                  onChange={e => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="categoryId">Categoria *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={value => {
                    setFormData({ ...formData, categoryId: value });
                    if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: '' }));
                  }}
                  required
                >
                  <SelectTrigger id="categoryId" className={errors.categoryId ? 'border-destructive' : ''}>
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
                {errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">{errors.categoryId}</p>
                )}
              </div>

              <div>
                <Label htmlFor="costCenterId">Centro de Custo *</Label>
                <Select
                  value={formData.costCenterId}
                  onValueChange={value => {
                    setFormData({ ...formData, costCenterId: value });
                    if (errors.costCenterId) setErrors(prev => ({ ...prev, costCenterId: '' }));
                  }}
                  required
                >
                  <SelectTrigger id="costCenterId" className={errors.costCenterId ? 'border-destructive' : ''}>
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
                {errors.costCenterId && (
                  <p className="text-sm text-destructive mt-1">{errors.costCenterId}</p>
                )}
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
                <Label htmlFor="supplierName">Fornecedor</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={e =>
                    setFormData({ ...formData, supplierName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="expectedAmount">Valor Esperado (R$) *</Label>
                <Input
                  id="expectedAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.expectedAmount}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      expectedAmount: parseFloat(e.target.value) || 0,
                    });
                    if (errors.expectedAmount) setErrors(prev => ({ ...prev, expectedAmount: '' }));
                  }}
                  className={errors.expectedAmount ? 'border-destructive' : ''}
                />
                {errors.expectedAmount && (
                  <p className="text-sm text-destructive mt-1">{errors.expectedAmount}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dueDate">Data de Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={e => {
                    setFormData({ ...formData, dueDate: e.target.value });
                    if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: '' }));
                  }}
                  className={errors.dueDate ? 'border-destructive' : ''}
                />
                {errors.dueDate && (
                  <p className="text-sm text-destructive mt-1">{errors.dueDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="discount">Desconto (R$)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
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
                  min="0"
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
                  min="0"
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
              <Link href={`/finance/payable/${id}`}>
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
      </PageBody>
    </PageLayout>
  );
}
