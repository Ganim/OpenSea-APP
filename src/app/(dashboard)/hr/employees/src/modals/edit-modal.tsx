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
import { EntityForm } from '@/core';
import type { Employee } from '@/types/hr';
import { Edit, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { employeesConfig } from '../config/employees.config';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  isSubmitting: boolean;
  onSubmit: (id: string, data: Partial<Employee>) => Promise<void>;
}

export function EditModal({
  isOpen,
  onClose,
  employee,
  isSubmitting,
  onSubmit,
}: EditModalProps) {
  const router = useRouter();

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <Users className="h-5 w-5" />
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
                    router.push(`/hr/employees/${employee.id}?action=edit`);
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
        <EntityForm
          config={employeesConfig.form! as never}
          mode="edit"
          initialData={employee as never}
          onSubmit={async data => {
            await onSubmit(
              employee.id,
              data as Record<string, unknown> as Partial<Employee>
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
