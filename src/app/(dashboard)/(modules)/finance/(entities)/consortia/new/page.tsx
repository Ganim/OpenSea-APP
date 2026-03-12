/**
 * Create Consortium Page - Rebuilt with improved UX and toast notifications.
 */

'use client';

import { Header } from '@/components/layout/header';
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
import { toast } from 'sonner';

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
    creditValue: '',
    monthlyPayment: '',
    totalInstallments: '',
    paymentDay: '',
    startDate: new Date().toISOString().split('T')[0],
    bankAccountId: '',
    costCenterId: '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bankAccountId || !formData.costCenterId) {
      toast.error('Selecione uma conta bancária e um centro de custo.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        administrator: formData.administrator,
        bankAccountId: formData.bankAccountId,
        costCenterId: formData.costCenterId,
        creditValue: parseFloat(formData.creditValue) || 0,
        monthlyPayment: parseFloat(formData.monthlyPayment) || 0,
        totalInstallments: parseInt(formData.totalInstallments) || 1,
        startDate: formData.startDate,
        paymentDay: formData.paymentDay
          ? parseInt(formData.paymentDay)
          : undefined,
        groupNumber: formData.groupNumber || undefined,
        quotaNumber: formData.quotaNumber || undefined,
        notes: formData.notes || undefined,
      });
      toast.success('Consórcio criado com sucesso.');
      router.push('/finance/consortia');
    } catch {
      toast.error(
        'Erro ao criar consórcio. Verifique os dados e tente novamente.'
      );
    }
  };

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Financeiro', href: '/finance' },
            { label: 'Consórcios', href: '/finance/consortia' },
            { label: 'Novo Consórcio' },
          ]}
        />

        <div className="flex items-center gap-4">
          <Link href="/finance/consortia">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <Header
            title="Novo Consórcio"
            description="Cadastre uma nova cota de consórcio"
          />
        </div>
      </PageHeader>

      <PageBody>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Consórcio */}
            <div>
              <h3 className="text-base font-semibold mb-4">
                Dados do Consórcio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome/Descrição *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Ex: Consórcio Imóvel Residencial"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="administrator">Administradora *</Label>
                  <Input
                    id="administrator"
                    required
                    placeholder="Ex: Porto Seguro, Embracon, Rodobens..."
                    value={formData.administrator}
                    onChange={e =>
                      handleChange('administrator', e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupNumber">Grupo</Label>
                    <Input
                      id="groupNumber"
                      placeholder="Ex: 0123"
                      value={formData.groupNumber}
                      onChange={e =>
                        handleChange('groupNumber', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="quotaNumber">Cota</Label>
                    <Input
                      id="quotaNumber"
                      placeholder="Ex: 045"
                      value={formData.quotaNumber}
                      onChange={e =>
                        handleChange('quotaNumber', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dados Financeiros */}
            <div>
              <h3 className="text-base font-semibold mb-4">
                Dados Financeiros
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="creditValue">Valor do Crédito (R$) *</Label>
                  <Input
                    id="creditValue"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formData.creditValue}
                    onChange={e => handleChange('creditValue', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyPayment">Parcela Mensal (R$) *</Label>
                  <Input
                    id="monthlyPayment"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formData.monthlyPayment}
                    onChange={e =>
                      handleChange('monthlyPayment', e.target.value)
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
                    placeholder="Ex: 120"
                    value={formData.totalInstallments}
                    onChange={e =>
                      handleChange('totalInstallments', e.target.value)
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
                    placeholder="Ex: 15"
                    value={formData.paymentDay}
                    onChange={e => handleChange('paymentDay', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Datas */}
            <div>
              <h3 className="text-base font-semibold mb-4">Datas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Adesão *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => handleChange('startDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Classificação */}
            <div>
              <h3 className="text-base font-semibold mb-4">Classificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankAccountId">Conta Bancária *</Label>
                  <Select
                    value={formData.bankAccountId}
                    onValueChange={v => handleChange('bankAccountId', v)}
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
                    onValueChange={v => handleChange('costCenterId', v)}
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
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Informações adicionais sobre o consórcio..."
              />
            </div>

            {/* Ações */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Link href="/finance/consortia">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? 'Salvando...' : 'Criar Consórcio'}
              </Button>
            </div>
          </form>
        </Card>
      </PageBody>
    </PageLayout>
  );
}
