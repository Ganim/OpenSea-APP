/**
 * Edit Consortium Page
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
  useConsortium,
  useCostCenters,
  useUpdateConsortium,
} from '@/hooks/finance';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function EditConsortiumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useConsortium(id);
  const updateMutation = useUpdateConsortium();
  const consortium = data?.consortium;

  const { data: bankAccountsData } = useBankAccounts();
  const { data: costCentersData } = useCostCenters();
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];
  const costCenters = costCentersData?.costCenters ?? [];

  const [formData, setFormData] = useState({
    name: '',
    administrator: '',
    bankAccountId: '',
    costCenterId: '',
    groupNumber: '',
    quotaNumber: '',
    contractNumber: '',
    paymentDay: 1,
    notes: '',
  });

  useEffect(() => {
    if (consortium) {
      setFormData({
        name: consortium.name,
        administrator: consortium.administrator,
        bankAccountId: consortium.bankAccountId,
        costCenterId: consortium.costCenterId,
        groupNumber: consortium.groupNumber || '',
        quotaNumber: consortium.quotaNumber || '',
        contractNumber: consortium.contractNumber || '',
        paymentDay: consortium.paymentDay || 1,
        notes: consortium.notes || '',
      });
    }
  }, [consortium]);

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

  if (!consortium) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Consórcio não encontrado.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: formData.name,
          administrator: formData.administrator,
          bankAccountId: formData.bankAccountId,
          costCenterId: formData.costCenterId,
          paymentDay: formData.paymentDay,
          groupNumber: formData.groupNumber || undefined,
          quotaNumber: formData.quotaNumber || undefined,
          contractNumber: formData.contractNumber || undefined,
          notes: formData.notes || undefined,
        },
      });
      router.push(`/finance/consortia/${id}`);
    } catch {
      alert('Erro ao atualizar consórcio');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/finance/consortia/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Consórcio</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="administrator">Administradora *</Label>
              <Input
                id="administrator"
                required
                value={formData.administrator}
                onChange={e =>
                  setFormData({ ...formData, administrator: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="bankAccountId">Conta Bancária *</Label>
              <Select
                value={formData.bankAccountId}
                onValueChange={value =>
                  setFormData({ ...formData, bankAccountId: value })
                }
                required
              >
                <SelectTrigger id="bankAccountId">
                  <SelectValue placeholder="Selecione uma conta" />
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
              <Label htmlFor="costCenterId">Centro de Custo *</Label>
              <Select
                value={formData.costCenterId}
                onValueChange={value =>
                  setFormData({ ...formData, costCenterId: value })
                }
                required
              >
                <SelectTrigger id="costCenterId">
                  <SelectValue placeholder="Selecione um centro de custo" />
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
              <Label htmlFor="contractNumber">Número do Contrato</Label>
              <Input
                id="contractNumber"
                value={formData.contractNumber}
                onChange={e =>
                  setFormData({ ...formData, contractNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="groupNumber">Código do Grupo</Label>
              <Input
                id="groupNumber"
                value={formData.groupNumber}
                onChange={e =>
                  setFormData({ ...formData, groupNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="quotaNumber">Número da Cota</Label>
              <Input
                id="quotaNumber"
                value={formData.quotaNumber}
                onChange={e =>
                  setFormData({ ...formData, quotaNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="paymentDay">Dia de Vencimento</Label>
              <Input
                id="paymentDay"
                type="number"
                min="1"
                max="31"
                value={formData.paymentDay}
                onChange={e =>
                  setFormData({
                    ...formData,
                    paymentDay: parseInt(e.target.value) || 1,
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
            <Link href={`/finance/consortia/${id}`}>
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
