'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { EntityForm } from '@/core';
import type { Position } from '@/types/hr';
import { Briefcase, Building2, Edit, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { positionsConfig } from '../config/positions.config';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  isSubmitting: boolean;
  onSubmit: (id: string, data: Partial<Position>) => Promise<void>;
}

export function EditModal({
  isOpen,
  onClose,
  position,
  isSubmitting,
  onSubmit,
}: EditModalProps) {
  const router = useRouter();

  if (!position) return null;

  // Função auxiliar para mostrar departamento com empresa
  const getDepartmentWithCompany = () => {
    if (!position.department) return 'Nenhum departamento vinculado';
    const companyName =
      position.department.company?.tradeName ||
      position.department.company?.legalName;
    if (companyName) {
      return `${position.department.name} - ${companyName}`;
    }
    return position.department.name;
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex-col flex">Edição Rápida</div>
            </div>
          </DialogTitle>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    onClose();
                    router.push(`/hr/positions/${position.id}/edit`);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edição avançada</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClose()}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fechar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </DialogHeader>

        {/* Departamento vinculado (apenas visualização) */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Departamento</p>
              <p className="text-sm text-muted-foreground">
                {getDepartmentWithCompany()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Para alterar o departamento, use a edição avançada
              </p>
            </div>
          </div>
        </Card>

        <EntityForm
          config={positionsConfig.form! as never}
          mode="edit"
          initialData={position as never}
          onSubmit={async data => {
            await onSubmit(
              position.id,
              data as Record<string, unknown> as Partial<Position>
            );
            onClose();
          }}
          onCancel={() => onClose()}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
