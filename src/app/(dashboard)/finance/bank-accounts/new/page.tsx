/**
 * Create Bank Account Page
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
import { useCreateBankAccount } from '@/hooks/finance';
import { BANK_ACCOUNT_TYPE_LABELS, PIX_KEY_TYPE_LABELS } from '@/types/finance';
import type { CreateBankAccountData } from '@/types/finance';
import { companiesService } from '@/services/hr';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewBankAccountPage() {
  const router = useRouter();
  const createMutation = useCreateBankAccount();

  const { data: companiesData } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesService.listCompanies({ perPage: 100 }),
  });

  const companies = companiesData?.companies ?? [];

  const [formData, setFormData] = useState({
    companyId: '',
    name: '',
    bankCode: '',
    bankName: '',
    agency: '',
    agencyDigit: '',
    accountNumber: '',
    accountDigit: '',
    accountType: 'CHECKING' as const,
    pixKeyType: '',
    pixKey: '',
    color: '#3b82f6',
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        companyId: formData.companyId,
        name: formData.name,
        bankCode: formData.bankCode,
        agency: formData.agency,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
        bankName: formData.bankName || undefined,
        agencyDigit: formData.agencyDigit || undefined,
        accountDigit: formData.accountDigit || undefined,
        pixKeyType: (formData.pixKeyType ||
          undefined) as CreateBankAccountData['pixKeyType'],
        pixKey: formData.pixKey || undefined,
        color: formData.color || undefined,
        isDefault: formData.isDefault,
      });
      router.push('/finance/bank-accounts');
    } catch {
      alert('Erro ao criar conta bancária');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance/bank-accounts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Nova Conta Bancária</h1>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="companyId">Empresa *</Label>
              <Select
                value={formData.companyId}
                onValueChange={value =>
                  setFormData({ ...formData, companyId: value })
                }
                required
              >
                <SelectTrigger id="companyId">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.legalName || company.tradeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="name">Nome da Conta *</Label>
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
              <Label htmlFor="bankCode">Código do Banco *</Label>
              <Input
                id="bankCode"
                required
                value={formData.bankCode}
                onChange={e =>
                  setFormData({ ...formData, bankCode: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="bankName">Nome do Banco *</Label>
              <Input
                id="bankName"
                required
                value={formData.bankName}
                onChange={e =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="agency">Agência *</Label>
              <Input
                id="agency"
                required
                value={formData.agency}
                onChange={e =>
                  setFormData({ ...formData, agency: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="agencyDigit">Dígito da Agência</Label>
              <Input
                id="agencyDigit"
                value={formData.agencyDigit}
                onChange={e =>
                  setFormData({ ...formData, agencyDigit: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Número da Conta *</Label>
              <Input
                id="accountNumber"
                required
                value={formData.accountNumber}
                onChange={e =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="accountDigit">Dígito da Conta</Label>
              <Input
                id="accountDigit"
                value={formData.accountDigit}
                onChange={e =>
                  setFormData({ ...formData, accountDigit: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="accountType">Tipo de Conta *</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value: string) =>
                  setFormData({
                    ...formData,
                    accountType: value as typeof formData.accountType,
                  })
                }
              >
                <SelectTrigger id="accountType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BANK_ACCOUNT_TYPE_LABELS).map(
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
              <Label htmlFor="pixKeyType">Tipo de Chave PIX</Label>
              <Select
                value={formData.pixKeyType}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, pixKeyType: value })
                }
              >
                <SelectTrigger id="pixKeyType">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PIX_KEY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={formData.pixKey}
                onChange={e =>
                  setFormData({ ...formData, pixKey: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={e =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={e =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isDefault" className="cursor-pointer">
                  Conta padrão
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Link href="/finance/bank-accounts">
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
