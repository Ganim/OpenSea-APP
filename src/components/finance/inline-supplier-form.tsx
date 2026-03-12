'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateFinanceSupplier } from '@/hooks/finance';
import type { Supplier } from '@/types/stock';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface InlineSupplierFormProps {
  onCreated: (supplier: { id: string; name: string }) => void;
  onCancel: () => void;
}

export function InlineSupplierForm({
  onCreated,
  onCancel,
}: InlineSupplierFormProps) {
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);

  const createMutation = useCreateFinanceSupplier();

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits;
  };

  const handleCnpjChange = async (value: string) => {
    const digits = formatCnpj(value);
    setCnpj(digits);

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

      try {
        const result = await createMutation.mutateAsync({
          name: name.trim(),
          cnpj: cnpj || undefined,
        });
        const supplier = (result as { supplier: Supplier }).supplier;
        onCreated({ id: supplier.id, name: supplier.name });
        toast.success('Fornecedor criado com sucesso!');
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Erro ao criar fornecedor.';
        toast.error(msg);
      }
    },
    [name, cnpj, createMutation, onCreated]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="supplier-name">Nome *</Label>
        <div className="relative">
          <Input
            id="supplier-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do fornecedor"
            required
          />
          {isLookingUp && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier-cnpj">CNPJ</Label>
        <Input
          id="supplier-cnpj"
          value={cnpj}
          onChange={e => handleCnpjChange(e.target.value)}
          placeholder="00000000000000"
          maxLength={14}
        />
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
            'Criar Fornecedor'
          )}
        </Button>
      </div>
    </form>
  );
}
