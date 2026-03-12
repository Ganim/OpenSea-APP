'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateFinanceCustomer } from '@/hooks/finance';
import type { Customer } from '@/types/sales';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface InlineCustomerFormProps {
  onCreated: (customer: { id: string; name: string }) => void;
  onCancel: () => void;
}

export function InlineCustomerForm({
  onCreated,
  onCancel,
}: InlineCustomerFormProps) {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);

  const createMutation = useCreateFinanceCustomer();

  const formatDocument = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 14);
  };

  const handleDocumentChange = async (value: string) => {
    const digits = formatDocument(value);
    setDocument(digits);

    // CNPJ lookup (14 digits)
    if (digits.length === 14) {
      setIsLookingUp(true);
      try {
        const res = await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${digits}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.razao_social) {
            setName(data.razao_social);
          }
        }
      } catch {
        // Ignore lookup errors silently
      } finally {
        setIsLookingUp(false);
      }
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      const isCnpj = document.length === 14;

      try {
        const result = await createMutation.mutateAsync({
          name: name.trim(),
          type: isCnpj ? 'BUSINESS' : 'INDIVIDUAL',
          document: document || undefined,
        });
        const customer = (result as { customer: Customer }).customer;
        onCreated({ id: customer.id, name: customer.name });
        toast.success('Cliente criado com sucesso!');
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Erro ao criar cliente.';
        toast.error(msg);
      }
    },
    [name, document, createMutation, onCreated]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer-name">Nome *</Label>
        <div className="relative">
          <Input
            id="customer-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do cliente"
            required
          />
          {isLookingUp && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-document">CPF/CNPJ</Label>
        <Input
          id="customer-document"
          value={document}
          onChange={e => handleDocumentChange(e.target.value)}
          placeholder="CPF (11 digitos) ou CNPJ (14 digitos)"
          maxLength={14}
        />
        <p className="text-xs text-muted-foreground">
          {document.length === 11
            ? 'CPF detectado'
            : document.length === 14
              ? 'CNPJ detectado'
              : 'Informe CPF ou CNPJ (opcional)'}
        </p>
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
            'Criar Cliente'
          )}
        </Button>
      </div>
    </form>
  );
}
