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
import type { Department } from '@/types/hr';
import { Building2, Calendar, Edit, RefreshCcwDot, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

export function ViewModal({ isOpen, onClose, department }: ViewModalProps) {
  const router = useRouter();

  if (!department) return null;

  const companyName =
    department.company?.tradeName || department.company?.legalName;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-blue-500 to-cyan-600 p-2 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">Departamento</span>
                {department.name.length > 32
                  ? `${department.name.substring(0, 32)}...`
                  : department.name}
              </div>
            </div>
          </DialogTitle>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClose();
                    router.push(`/hr/departments/${department.id}`);
                  }}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
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

        <div className="space-y-6">
          {/* Empresa */}
          {companyName && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shrink-0">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">{companyName}</p>
                  {department.company?.cnpj && (
                    <p className="text-sm text-muted-foreground">
                      {department.company.cnpj}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Dados Cadastrais */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados Cadastrais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-base mt-1">{department.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="text-base mt-1">{department.code}</p>
              </div>
              {department.description && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="text-base mt-1">{department.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-base mt-1">
                  {department.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Inativo
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Metadados */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Metadados</h3>
            <div className="space-y-3">
              {department.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-500">Criado em:</span>
                  <span className="font-medium">
                    {new Date(department.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {department.updatedAt &&
                department.updatedAt !== department.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCcwDot className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-500">Atualizado em:</span>
                    <span className="font-medium">
                      {new Date(department.updatedAt).toLocaleDateString(
                        'pt-BR'
                      )}
                    </span>
                  </div>
                )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
