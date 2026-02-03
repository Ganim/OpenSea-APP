/**
 * Permission Group Detail Modal
 * Modal para visualização de detalhes do grupo de permissões
 */

'use client';

import { Badge } from '@/components/ui/badge';
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
import { Calendar, Shield, Users, X } from 'lucide-react';
import type { DetailModalProps } from '../types';
import {
  getStatusBadgeVariant,
  getStatusLabel,
  getTypeBadgeVariant,
  getTypeLabel,
} from '../utils/permission-groups.utils';

export function DetailModal({ group, open, onOpenChange }: DetailModalProps) {
  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">
                  Grupo de Permissões
                </span>
                {group.name}
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
            {/* Slug */}
            {group.slug && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Slug</span>
                </div>
                <p className="text-sm text-muted-foreground">{group.slug}</p>
              </div>
            )}

            {/* Status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge variant={getStatusBadgeVariant(group.isActive)}>
                {getStatusLabel(group.isActive)}
              </Badge>
            </div>

            {/* Tipo */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Tipo</span>
              </div>
              <Badge variant={getTypeBadgeVariant(group.isSystem)}>
                {getTypeLabel(group.isSystem)}
              </Badge>
            </div>

            {/* Prioridade */}
            {group.priority !== undefined && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Prioridade</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {group.priority}
                </p>
              </div>
            )}
          </div>

          {/* Descrição */}
          {group.description && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-medium">Descrição</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            </div>
          )}

          {/* Datas */}
          {(group.createdAt || group.updatedAt) && (
            <div className="border-t pt-4 grid grid-cols-2 gap-6">
              {group.createdAt && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Criado em</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(group.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}

              {group.updatedAt && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-medium">Atualizado em</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(group.updatedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
