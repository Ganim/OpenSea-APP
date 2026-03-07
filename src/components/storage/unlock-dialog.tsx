'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storageSecurityService } from '@/services/storage';
import { toast } from 'sonner';

interface UnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemType: 'file' | 'folder';
  itemName: string;
  onUnlocked: (password: string) => void;
}

export function UnlockDialog({
  open,
  onOpenChange,
  itemId,
  itemType,
  itemName,
  onUnlocked,
}: UnlockDialogProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) return;

    setLoading(true);
    try {
      const { valid } = await storageSecurityService.verifyProtection({
        itemId,
        itemType,
        password,
      });

      if (valid) {
        onUnlocked(password);
        onOpenChange(false);
        setPassword('');
      } else {
        toast.error('Senha incorreta');
      }
    } catch {
      toast.error('Erro ao verificar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setPassword('');
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Item protegido
          </DialogTitle>
          <DialogDescription>
            &quot;{itemName}&quot; está protegido(a) por senha. Informe a senha
            para acessar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlock-password">Senha</Label>
            <Input
              id="unlock-password"
              type="password"
              placeholder="Informe a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading || !password}>
              {loading ? 'Verificando...' : 'Desbloquear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
