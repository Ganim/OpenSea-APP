'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCostCenter } from '@/hooks/finance';
import type { CostCenter } from '@/types/finance';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface InlineCostCenterFormProps {
  onCreated: (costCenter: { id: string; name: string }) => void;
  onCancel: () => void;
}

export function InlineCostCenterForm({
  onCreated,
  onCancel,
}: InlineCostCenterFormProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const createMutation = useCreateCostCenter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !code.trim()) return;

      try {
        const result = await createMutation.mutateAsync({
          name: name.trim(),
          code: code.trim(),
        });
        const costCenter = (result as { costCenter: CostCenter }).costCenter;
        onCreated({ id: costCenter.id, name: costCenter.name });
        toast.success('Centro de custo criado com sucesso!');
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Erro ao criar centro de custo.';
        toast.error(msg);
      }
    },
    [name, code, createMutation, onCreated]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cc-name">Nome *</Label>
        <Input
          id="cc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do centro de custo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cc-code">Codigo *</Label>
        <Input
          id="cc-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: CC-001"
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || !name.trim() || !code.trim()}
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Centro de Custo'
          )}
        </Button>
      </div>
    </form>
  );
}
