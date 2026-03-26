'use client';

import { translateError } from '@/lib/error-messages';
import { Button } from '@/components/ui/button';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
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
import type { BankAccount, BankAccountType } from '@/types/finance';
import { BANK_ACCOUNT_TYPE_LABELS } from '@/types/finance';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface InlineBankAccountFormProps {
  onCreated: (bankAccount: { id: string; name: string }) => void;
  onCancel: () => void;
}

export function InlineBankAccountForm({
  onCreated,
  onCancel,
}: InlineBankAccountFormProps) {
  const [name, setName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [agency, setAgency] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<BankAccountType>('CHECKING');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateBankAccount();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      try {
        const result = await createMutation.mutateAsync({
          name: name.trim(),
          bankCode: bankCode || '000',
          agency: agency || '0000',
          accountNumber: accountNumber || '00000000',
          accountType,
        });
        const bankAccount = (result as { bankAccount: BankAccount })
          .bankAccount;
        onCreated({ id: bankAccount.id, name: bankAccount.name });
        toast.success('Conta bancária criada com sucesso!');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('name already') || msg.includes('already exists')) {
          setFieldErrors({ name: translateError(msg) });
        } else if (
          msg.includes('bank code') ||
          msg.includes('Invalid bank code')
        ) {
          setFieldErrors({ bankCode: translateError(msg) });
        } else {
          toast.error(translateError(msg));
        }
      }
    },
    [
      name,
      bankCode,
      agency,
      accountNumber,
      accountType,
      createMutation,
      onCreated,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ba-name">Nome *</Label>
        <div className="relative">
          <Input
            id="ba-name"
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (fieldErrors.name)
                setFieldErrors(prev => ({ ...prev, name: '' }));
            }}
            placeholder="Nome da conta"
            required
            aria-invalid={!!fieldErrors.name}
          />
          <FormErrorIcon message={fieldErrors.name} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="ba-bankcode">Código do Banco</Label>
          <Input
            id="ba-bankcode"
            value={bankCode}
            onChange={e => setBankCode(e.target.value)}
            placeholder="001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ba-agency">Agência</Label>
          <Input
            id="ba-agency"
            value={agency}
            onChange={e => setAgency(e.target.value)}
            placeholder="0001"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="ba-account">Número da Conta</Label>
          <Input
            id="ba-account"
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            placeholder="00000000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ba-type">Tipo</Label>
          <Select
            value={accountType}
            onValueChange={v => setAccountType(v as BankAccountType)}
          >
            <SelectTrigger id="ba-type">
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
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || !name.trim()}
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Conta'
          )}
        </Button>
      </div>
    </form>
  );
}
