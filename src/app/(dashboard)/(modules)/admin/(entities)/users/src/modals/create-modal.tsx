/**
 * Create User Modal
 * Renderiza modal para criação de novo usuário
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateModalProps } from '../types/users.types';
import { isNewUserValid } from '../utils';

export function CreateModal({
  isOpen,
  onOpenChange,
  onCreateUser,
  newUser,
  setNewUser,
}: CreateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo usuário. As permissões serão
            gerenciadas através de grupos de permissões após a criação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="joaosilva"
              value={newUser.username}
              onChange={e =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="joao@exemplo.com"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={newUser.password}
              onChange={e =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onCreateUser} disabled={!isNewUserValid(newUser)}>
            Criar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
