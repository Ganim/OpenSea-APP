/**
 * Create Consortium Page
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
  useCreateConsortium,
} from '@/hooks/finance';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewConsortiumPage() {
  const router = useRouter();
  const createMutation = useCreateConsortium();

  const { data: bankAccountsData } = useBankAccounts();
  const { data: costCentersData } = useCostCenters();

  const bankAccounts = bankAccountsData?.bankAccounts ?? [];
  const costCenters = costCentersData?.costCenters ?? [];

  const [formData, setFormData] = useState({
    name: '',
    administrator: '',
    groupNumber: '',
    quotaNumber: '',
    creditValue: 0,
    monthlyPayment: 0,
    totalInstallments: 1,
    paymentDay: 1,
    startDate: new Date().toISOString().split('T')[0],
    bankAccountId: '',
    costCenterId: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        administrator: formData.administrator,
        bankAccountId: formData.bankAccountId,
        costCenterId: formData.costCenterId,
        creditValue: formData.creditValue,
        monthlyPayment: formData.monthlyPayment,
        totalInstallments: formData.totalInstallments,
        startDate: formData.startDate,
        paymentDay: formData.paymentDay,
        groupNumber: formData.groupNumber || undefined,
        quotaNumber: formData.quotaNumber || undefined,
        notes: formData.notes || undefined,
      });
      router.push('/finance/consortia');
    } catch {
      alert('Erro ao criar consórcio');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance/consortia">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Novo Consórcio</h1>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
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
                onChange={(e) =>
                  setFormData({ ...formData, administrator: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="bankAccountId">Conta Bancária *</Label>
              <Select
                value={formData.bankAccountId}
                onValueChange={(value) =>
                  setFormData({ ...formData, bankAccountId: value })
                }
                required
              >
                <SelectTrigger id="bankAccountId">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((ba) => (
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
                onValueChange={(value) =>
                  setFormData({ ...formData, costCenterId: value })
                }
                required
              >
                <SelectTrigger id="costCenterId">
                  <SelectValue placeholder="Selecione um centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="groupNumber">Código do Grupo</Label>
              <Input
                id="groupNumber"
                value={formData.groupNumber}
                onChange={(e) =>
                  setFormData({ ...formData, groupNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="quotaNumber">Número da Cota</Label>
              <Input
                id="quotaNumber"
                value={formData.quotaNumber}
                onChange={(e) =>
                  setFormData({ ...formData, quotaNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="creditValue">Valor da Carta (R$) *</Label>
              <Input
                id="creditValue"
                type="number"
                step="0.01"
                required
                value={formData.creditValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    creditValue: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="monthlyPayment">Parcela Mensal (R$) *</Label>
              <Input
                id="monthlyPayment"
                type="number"
                step="0.01"
                required
                value={formData.monthlyPayment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monthlyPayment: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="totalInstallments">Total de Parcelas *</Label>
              <Input
                id="totalInstallments"
                type="number"
                required
                min="1"
                value={formData.totalInstallments}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalInstallments: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="paymentDay">Dia de Vencimento *</Label>
              <Input
                id="paymentDay"
                type="number"
                required
                min="1"
                max="31"
                value={formData.paymentDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentDay: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Link href="/finance/consortia">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={createMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
