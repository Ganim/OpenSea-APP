/**
 * Create Loan Page - Rebuilt with amortization system selection and better UX.
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
  useCreateLoan,
} from '@/hooks/finance';
import { LOAN_TYPE_LABELS } from '@/types/finance';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewLoanPage() {
  const router = useRouter();
  const createMutation = useCreateLoan();

  const { data: bankAccountsData } = useBankAccounts();
  const { data: costCentersData } = useCostCenters();

  const bankAccounts = bankAccountsData?.bankAccounts ?? [];
  const costCenters = costCentersData?.costCenters ?? [];

  const [formData, setFormData] = useState({
    bankAccountId: '',
    costCenterId: '',
    name: '',
    type: 'PERSONAL' as string,
    contractNumber: '',
    principalAmount: '',
    interestRate: '',
    interestType: 'COMPOUND',
    startDate: new Date().toISOString().split('T')[0],
    totalInstallments: '',
    installmentDay: '',
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
        bankAccountId: formData.bankAccountId,
        costCenterId: formData.costCenterId,
        name: formData.name,
        type: formData.type as 'PERSONAL',
        principalAmount: parseFloat(formData.principalAmount) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
        interestType: formData.interestType || undefined,
        startDate: formData.startDate,
        totalInstallments: parseInt(formData.totalInstallments) || 1,
        installmentDay: formData.installmentDay
          ? parseInt(formData.installmentDay)
          : undefined,
        contractNumber: formData.contractNumber || undefined,
        notes: formData.notes || undefined,
      });
      toast.success('Empréstimo criado com sucesso.');
      router.push('/finance/loans');
    } catch {
      toast.error(
        'Erro ao criar empréstimo. Verifique os dados e tente novamente.'
      );
    }
  };

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Financeiro', href: '/finance' },
            { label: 'Empréstimos', href: '/finance/loans' },
            { label: 'Novo Empréstimo' },
          ]}
        />

        <div className="flex items-center gap-4">
          <Link href="/finance/loans">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <Header
            title="Novo Empréstimo"
            description="Cadastre um novo empréstimo ou financiamento"
          />
        </div>
      </PageHeader>

      <PageBody>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Básicos */}
            <div>
              <h3 className="text-base font-semibold mb-4">
                Dados do Empréstimo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Descrição *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Ex: Financiamento Imobiliário Banco do Brasil"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={v => handleChange('type', v)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LOAN_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contractNumber">Número do Contrato</Label>
                  <Input
                    id="contractNumber"
                    placeholder="Opcional"
                    value={formData.contractNumber}
                    onChange={e =>
                      handleChange('contractNumber', e.target.value)
                    }
                  />
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
                  <Label htmlFor="principalAmount">
                    Valor Principal (R$) *
                  </Label>
                  <Input
                    id="principalAmount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formData.principalAmount}
                    onChange={e =>
                      handleChange('principalAmount', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="interestRate">Taxa de Juros (% a.a.) *</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 12.00"
                    value={formData.interestRate}
                    onChange={e => handleChange('interestRate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="interestType">Sistema de Amortização *</Label>
                  <Select
                    value={formData.interestType}
                    onValueChange={v => handleChange('interestType', v)}
                  >
                    <SelectTrigger id="interestType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPOUND">
                        Tabela Price (Parcela Fixa)
                      </SelectItem>
                      <SelectItem value="SAC">
                        SAC (Amortização Constante)
                      </SelectItem>
                      <SelectItem value="SIMPLE">Juros Simples</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="totalInstallments">Total de Parcelas *</Label>
                  <Input
                    id="totalInstallments"
                    type="number"
                    required
                    min="1"
                    placeholder="Ex: 60"
                    value={formData.totalInstallments}
                    onChange={e =>
                      handleChange('totalInstallments', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Datas e Vencimento */}
            <div>
              <h3 className="text-base font-semibold mb-4">Datas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data do Contrato *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => handleChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="installmentDay">Dia de Vencimento</Label>
                  <Input
                    id="installmentDay"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ex: 10"
                    value={formData.installmentDay}
                    onChange={e =>
                      handleChange('installmentDay', e.target.value)
                    }
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
                placeholder="Informações adicionais sobre o empréstimo..."
              />
            </div>

            {/* Ações */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Link href="/finance/loans">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? 'Salvando...' : 'Criar Empréstimo'}
              </Button>
            </div>
          </form>
        </Card>
      </PageBody>
    </PageLayout>
  );
}
