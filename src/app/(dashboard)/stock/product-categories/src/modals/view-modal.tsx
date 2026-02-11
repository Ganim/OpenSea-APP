/**
 * OpenSea OS - View Category Modal
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
import type { Category } from '@/types/stock';
import { format } from 'date-fns';
import Image from 'next/image';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  CheckCircle2,
  FolderTree,
  Hash,
  Package,
  XCircle,
} from 'lucide-react';
import { PiFolderOpenDuotone } from 'react-icons/pi';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ViewModal({
  isOpen,
  onClose,
  category,
  onEdit,
  onDelete,
}: ViewModalProps) {
  if (!category) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {category.iconUrl ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 overflow-hidden">
                <Image
                  src={category.iconUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain brightness-0 invert"
                  unoptimized
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <PiFolderOpenDuotone className="h-5 w-5 text-blue-500" />
            )}
            {category.name}
          </DialogTitle>
          <DialogDescription>Detalhes da categoria</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            {category.isActive ? (
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
              <p className="text-base">{category.name}</p>
            </div>

            {category.slug && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Slug
                </h4>
                <p className="text-base font-mono text-sm">{category.slug}</p>
              </div>
            )}

            {category.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Descrição
                </h4>
                <p className="text-base text-muted-foreground">
                  {category.description}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Ordem de Exibição
              </h4>
              <p className="text-base">{category.displayOrder || 0}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <FolderTree className="h-3 w-3" />
                  Subcategorias
                </h4>
                <p className="text-base">{category.childrenCount || 0}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Produtos
                </h4>
                <p className="text-base">{category.productCount || 0}</p>
              </div>
            </div>

            {category.iconUrl && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Ícone
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-slate-600 to-slate-800 overflow-hidden">
                    <Image
                      src={category.iconUrl}
                      alt="Ícone"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain brightness-0 invert"
                      unoptimized
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
                    {category.iconUrl}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Metadados */}
          <div className="border-t pt-4 grid gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Criado em: {formatDate(category.createdAt)}</span>
            </div>
            {category.updatedAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Atualizado em: {formatDate(category.updatedAt)}</span>
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
