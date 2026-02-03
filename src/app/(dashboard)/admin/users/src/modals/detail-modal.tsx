/**
 * User Detail Modal
 * Renderiza modal para visualização de detalhes do usuário
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar, Lock, Mail, Shield, Users, X } from 'lucide-react';
import type { DetailModalProps } from '../types/users.types';
import { formatLastLoginDateTime } from '../utils';

export function DetailModal({
  isOpen,
  onOpenChange,
  selectedUser,
  onManageGroups,
}: DetailModalProps) {
  if (!selectedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onOpenChange(false)}>
      <DialogContent className="max-w-2xl [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-blue-500 to-cyan-600 p-2 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">Usuário</span>
                {selectedUser.username.length > 20
                  ? `${selectedUser.username.substring(0, 20)}...`
                  : selectedUser.username}
              </div>
            </div>
          </DialogTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="gap-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fechar</p>
            </TooltipContent>
          </Tooltip>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações básicas */}
          <div className="grid grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedUser.email}
              </p>
            </div>

            {/* Nome completo */}
            {selectedUser.profile?.name && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm font-medium">Nome Completo</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.profile.name}
                  {selectedUser.profile.surname &&
                    ` ${selectedUser.profile.surname}`}
                </p>
              </div>
            )}

            {/* Último acesso */}
            {selectedUser.lastLoginAt && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Último Acesso</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatLastLoginDateTime(selectedUser.lastLoginAt)}
                </p>
              </div>
            )}
          </div>

          {/* Datas */}
          {(selectedUser.createdAt || selectedUser.updatedAt) && (
            <div className="border-t pt-4 grid grid-cols-2 gap-6">
              {selectedUser.createdAt && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Criado em</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              {selectedUser.updatedAt && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Atualizado em</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.updatedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 border-t pt-4 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onManageGroups(selectedUser);
            }}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Gerenciar Grupos de Permissões
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
