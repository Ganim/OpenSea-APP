import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PermissionGroup } from '@/types/rbac';
import { Loader2, Shield, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: PermissionGroup | null;
  isSubmitting: boolean;
  onSubmit: (id: string, data: Partial<PermissionGroup>) => Promise<void>;
}

export function RenameModal({
  isOpen,
  onClose,
  group,
  isSubmitting,
  onSubmit,
}: RenameModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name || '');
    }
  }, [group]);

  if (!group) return null;

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Nome é obrigatório');
      return;
    }
    setError('');
    try {
      await onSubmit(group.id, { name: trimmed });
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao renomear grupo';
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('já existe')) {
        setError('Este nome já está em uso');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-3 items-center">
              <div
                className={cn(
                  'flex items-center justify-center text-white shrink-0 p-2 rounded-lg',
                  !group.color && 'bg-linear-to-br from-purple-500 to-pink-600'
                )}
                style={
                  group.color
                    ? {
                        background: `linear-gradient(to bottom right, ${group.color}, ${group.color}CC)`,
                      }
                    : undefined
                }
              >
                <Shield className="h-5 w-5" />
              </div>
              Renomear Grupo
            </div>
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="group-name">Nome do Grupo</Label>
            <div className="relative">
              <Input
                id="group-name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Digite o nome do grupo"
                autoFocus
                maxLength={255}
                aria-invalid={!!error}
              />
              {error && <FormErrorIcon message={error} />}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
