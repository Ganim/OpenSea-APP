/**
 * OpenSea OS - View Tag Modal
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
import type { Tag } from '@/types/stock';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, CheckCircle2, Tag as TagIcon, XCircle } from 'lucide-react';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: Tag | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ViewModal({
  isOpen,
  onClose,
  tag,
  onEdit,
  onDelete,
}: ViewModalProps) {
  if (!tag) return null;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return 'Data inválida';
    }
  };

  const isActive = !tag.deletedAt;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" style={{ color: tag.color }} />
            {tag.name}
          </DialogTitle>
          <DialogDescription>Detalhes da tag</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            {isActive ? (
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Ativa
              </Badge>
            ) : (
              <Badge className="bg-gray-500/20 text-gray-700 dark:text-gray-400">
                <XCircle className="mr-1 h-3 w-3" />
                Inativa
              </Badge>
            )}
          </div>

          {/* Informações Básicas */}
          <div className="grid gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Nome
              </h4>
              <p className="text-base">{tag.name}</p>
            </div>

            {tag.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Descrição
                </h4>
                <p className="text-base text-muted-foreground">
                  {tag.description}
                </p>
              </div>
            )}

            {tag.color && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Cor
                </h4>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <p className="text-base font-mono">{tag.color}</p>
                    <p className="text-sm text-muted-foreground">
                      Código da cor
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview da Tag */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Pré-visualização
            </h4>
            <div className="flex gap-2">
              <Badge
                style={{
                  backgroundColor: tag.color,
                  color: '#ffffff',
                }}
              >
                {tag.name}
              </Badge>
            </div>
          </div>

          {/* Metadados */}
          <div className="border-t pt-4 grid gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Criado em: {formatDate(tag.createdAt)}</span>
            </div>
            {tag.updatedAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Atualizado em: {formatDate(tag.updatedAt)}</span>
              </div>
            )}
            {tag.deletedAt && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <Calendar className="h-4 w-4" />
                <span>Excluído em: {formatDate(tag.deletedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              Excluir
            </Button>
          )}
          {onEdit && (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                onEdit();
                onClose();
              }}
            >
              Editar
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
