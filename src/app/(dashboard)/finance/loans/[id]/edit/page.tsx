/**
 * Edit Loan Page
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
  useLoan,
  useUpdateLoan,
} from '@/hooks/finance';
import { LOAN_TYPE_LABELS } from '@/types/finance';
import type { LoanType } from '@/types/finance';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function EditLoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useLoan(id);
  const updateMutation = useUpdateLoan();
  const loan = data?.loan;

  const { data: bankAccountsData } = useBankAccounts();
  const { data: costCentersData } = useCostCenters();
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];
  const costCenters = costCentersData?.costCenters ?? [];

  const [formData, setFormData] = useState({
    bankAccountId: '',
    costCenterId: '',
    name: '',
    type: 'PERSONAL' as LoanType,
    contractNumber: '',
    interestRate: 0,
    interestType: 'SIMPLE',
    endDate: '',
    installmentDay: 1,
    notes: '',
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        bankAccountId: loan.bankAccountId,
        costCenterId: loan.costCenterId,
        name: loan.name,
        type: loan.type,
        contractNumber: loan.contractNumber || '',
        interestRate: loan.interestRate,
        interestType: loan.interestType || 'SIMPLE',
        endDate: loan.endDate ? loan.endDate.split('T')[0] : '',
        installmentDay: loan.installmentDay || 1,
        notes: loan.notes || '',
      });
    }
  }, [loan]);

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

  if (!loan) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Empréstimo não encontrado.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          bankAccountId: formData.bankAccountId,
          costCenterId: formData.costCenterId,
          name: formData.name,
          type: formData.type,
          contractNumber: formData.contractNumber || undefined,
          interestType: formData.interestType || undefined,
          endDate: formData.endDate || undefined,
          installmentDay: formData.installmentDay,
          notes: formData.notes || undefined,
        },
      });
      router.push(`/finance/loans/${id}`);
    } catch {
      alert('Erro ao atualizar empréstimo');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/finance/loans/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Empréstimo</h1>
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
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bankAccountId">Conta Bancária *</Label>
              <Select
                value={formData.bankAccountId}
                onValueChange={value => setFormData({ ...formData, bankAccountId: value })}
                required
              >
                <SelectTrigger id="bankAccountId">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(ba => (
                    <SelectItem key={ba.id} value={ba.id}>{ba.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="costCenterId">Centro de Custo *</Label>
              <Select
                value={formData.costCenterId}
                onValueChange={value => setFormData({ ...formData, costCenterId: value })}
                required
              >
                <SelectTrigger id="costCenterId">
                  <SelectValue placeholder="Selecione um centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map(cc => (
                    <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, type: value as typeof formData.type })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOAN_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contractNumber">Número do Contrato</Label>
              <Input
                id="contractNumber"
                value={formData.contractNumber}
                onChange={e => setFormData({ ...formData, contractNumber: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="interestRate">Taxa de Juros (% a.m.)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={e =>
                  setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label htmlFor="interestType">Tipo de Juros</Label>
              <Select
                value={formData.interestType}
                onValueChange={(value: string) => setFormData({ ...formData, interestType: value })}
              >
                <SelectTrigger id="interestType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIMPLE">Simples</SelectItem>
                  <SelectItem value="COMPOUND">Composto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="installmentDay">Dia de Vencimento</Label>
              <Input
                id="installmentDay"
                type="number"
                min="1"
                max="31"
                value={formData.installmentDay}
                onChange={e =>
                  setFormData({ ...formData, installmentDay: parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Link href={`/finance/loans/${id}`}>
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
