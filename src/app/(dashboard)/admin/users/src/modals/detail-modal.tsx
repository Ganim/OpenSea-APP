/**
 * User Detail Modal
 * Renderiza modal para visualização de detalhes do usuário
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Mail, Shield, UserCircle } from 'lucide-react';
import type { DetailModalProps } from '../types/users.types';
import { formatLastLoginDateTime } from '../utils';

export function DetailModal({
  isOpen,
  onOpenChange,
  selectedUser,
  onManageGroups,
  getRoleBadgeVariant,
}: DetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
              <UserCircle className="h-5 w-5 text-white" />
            </div>
            {selectedUser?.username}
          </DialogTitle>
          <DialogDescription>{selectedUser?.email}</DialogDescription>
        </DialogHeader>

        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {selectedUser.email}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Papel</Label>
                <p className="mt-1">
                  <Badge
                    variant={
                      getRoleBadgeVariant(selectedUser.role) as
                        | 'destructive'
                        | 'default'
                        | 'secondary'
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                </p>
              </div>
              {selectedUser.profile?.name && (
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="mt-1">
                    {selectedUser.profile.name} {selectedUser.profile.surname}
                  </p>
                </div>
              )}
              {selectedUser.lastLoginAt && (
                <div>
                  <Label className="text-muted-foreground">Último Acesso</Label>
                  <p className="mt-1">
                    {formatLastLoginDateTime(selectedUser.lastLoginAt)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onManageGroups(selectedUser);
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Gerenciar Grupos
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
