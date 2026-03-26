'use client';

import { translateError } from '@/lib/error-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateFinanceCategory,
  useFinanceCategories,
} from '@/hooks/finance';
import type { FinanceCategory, FinanceCategoryType } from '@/types/finance';
import { FINANCE_CATEGORY_TYPE_LABELS } from '@/types/finance';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface InlineCategoryFormProps {
  onCreated: (category: { id: string; name: string }) => void;
  onCancel: () => void;
}

export function InlineCategoryForm({
  onCreated,
  onCancel,
}: InlineCategoryFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<FinanceCategoryType>('EXPENSE');
  const [parentId, setParentId] = useState('');

  const createMutation = useCreateFinanceCategory();
  const { data: categoriesData } = useFinanceCategories();
  const categories = categoriesData?.categories ?? [];

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      try {
        const result = await createMutation.mutateAsync({
          name: name.trim(),
          type,
          parentId: parentId || undefined,
        });
        const category = (result as { category: FinanceCategory }).category;
        onCreated({ id: category.id, name: category.name });
        toast.success('Categoria criada com sucesso!');
      } catch (err) {
        toast.error(translateError(err));
      }
    },
    [name, type, parentId, createMutation, onCreated]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Nome *</Label>
        <Input
          id="category-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome da categoria"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-type">Tipo</Label>
        <Select
          value={type}
          onValueChange={v => setType(v as FinanceCategoryType)}
        >
          <SelectTrigger id="category-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FINANCE_CATEGORY_TYPE_LABELS).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-parent">Categoria Pai</Label>
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger id="category-parent">
            <SelectValue placeholder="Nenhuma (raiz)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma (raiz)</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            'Criar Categoria'
          )}
        </Button>
      </div>
    </form>
  );
}
