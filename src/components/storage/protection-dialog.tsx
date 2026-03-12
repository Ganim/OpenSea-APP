'use client';

import { useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
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
import { useQueryClient } from '@tanstack/react-query';

interface ProtectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemType: 'file' | 'folder';
  itemName: string;
  isProtected: boolean;
}

export function ProtectionDialog({
  open,
  onOpenChange,
  itemId,
  itemType,
  itemName,
  isProtected,
}: ProtectionDialogProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleProtect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 4) {
      toast.error('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await storageSecurityService.protectItem({ itemId, itemType, password });
      toast.success(
        `${itemType === 'file' ? 'Arquivo' : 'Pasta'} protegido(a) com senha`
      );
      queryClient.invalidateQueries({ queryKey: ['storage'] });
      onOpenChange(false);
      setPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Erro ao proteger item');
    } finally {
      setLoading(false);
    }
  };

  const handleUnprotect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error('Informe a senha atual');
      return;
    }

    setLoading(true);
    try {
      await storageSecurityService.unprotectItem({
        itemId,
        itemType,
        password,
      });
      toast.success(
        `Proteção por senha removida do ${itemType === 'file' ? 'arquivo' : 'pasta'}`
      );
      queryClient.invalidateQueries({ queryKey: ['storage'] });
      onOpenChange(false);
      setPassword('');
    } catch {
      toast.error('Senha incorreta ou erro ao remover proteção');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) {
          setPassword('');
          setConfirmPassword('');
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isProtected ? (
              <LockOpen className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            {isProtected ? 'Remover proteção' : 'Proteger com senha'}
          </DialogTitle>
          <DialogDescription>
            {isProtected
              ? `Informe a senha atual para remover a proteção de "${itemName}"`
              : `Defina uma senha para proteger "${itemName}"`}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={isProtected ? handleUnprotect : handleProtect}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="protection-password">
              {isProtected ? 'Senha atual' : 'Senha'}
            </Label>
            <Input
              id="protection-password"
              type="password"
              placeholder={isProtected ? 'Senha atual' : 'Defina uma senha'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {!isProtected && (
            <div className="space-y-2">
              <Label htmlFor="protection-confirm">Confirmar senha</Label>
              <Input
                id="protection-confirm"
                type="password"
                placeholder="Confirme a senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

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
              {loading
                ? 'Processando...'
                : isProtected
                  ? 'Remover proteção'
                  : 'Proteger'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
