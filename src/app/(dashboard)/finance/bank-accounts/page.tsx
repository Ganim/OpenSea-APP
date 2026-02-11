'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBankAccounts } from '@/hooks/finance';
import {
  BANK_ACCOUNT_STATUS_LABELS,
  BANK_ACCOUNT_TYPE_LABELS,
} from '@/types/finance';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BankAccountsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useBankAccounts();
  const bankAccounts = data?.bankAccounts;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CLOSED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Contas Bancárias</h1>
            <p className="text-muted-foreground">
              Gerencie as contas bancárias da empresa
            </p>
          </div>
        </div>
        <Link href="/finance/bank-accounts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta Bancária
          </Button>
        </Link>
      </div>

      {/* Content */}
      <Card>
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-muted-foreground">
            Erro ao carregar contas bancárias
          </div>
        ) : !bankAccounts || bankAccounts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum registro encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Nome</th>
                  <th className="text-left p-4 font-semibold">Banco</th>
                  <th className="text-left p-4 font-semibold">Agência</th>
                  <th className="text-left p-4 font-semibold">Conta</th>
                  <th className="text-left p-4 font-semibold">Tipo</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-right p-4 font-semibold">Saldo Atual</th>
                  <th className="text-center p-4 font-semibold">Padrão</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bankAccounts.map(account => (
                  <tr
                    key={account.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(`/finance/bank-accounts/${account.id}`)
                    }
                  >
                    <td className="p-4 font-medium">{account.name}</td>
                    <td className="p-4">
                      {account.bankName || account.bankCode}
                    </td>
                    <td className="p-4 font-mono text-sm">
                      {account.agency}
                      {account.agencyDigit ? `-${account.agencyDigit}` : ''}
                    </td>
                    <td className="p-4 font-mono text-sm">
                      {account.accountNumber}
                      {account.accountDigit ? `-${account.accountDigit}` : ''}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {BANK_ACCOUNT_TYPE_LABELS[account.accountType]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}
                      >
                        {BANK_ACCOUNT_STATUS_LABELS[account.status]}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-sm">
                      {formatCurrency(account.currentBalance)}
                    </td>
                    <td className="p-4 text-center">
                      {account.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Padrão
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
