'use client';

import { InfoField } from '@/components/shared/info-field';
import { MetadataSection } from '@/components/shared/metadata-section';
import { Badge } from '@/components/ui/badge';
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
import type { Position } from '@/types/hr';
import {
  Briefcase,
  Building2,
  DollarSign,
  Edit,
  Layers,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatLevel, getSalaryRange } from '../utils';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
}

export function ViewModal({ isOpen, onClose, position }: ViewModalProps) {
  const router = useRouter();

  if (!position) return null;

  // Função auxiliar para mostrar departamento com empresa
  const getDepartmentWithCompany = () => {
    if (!position.department) return null;
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">Cargo</span>
                {position.name.length > 20
                  ? `${position.name.substring(0, 20)}...`
                  : position.name}
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
                    router.push(`/hr/positions/${position.id}/edit`);
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
          {/* Informações Básicas */}
          <Card className="p-6">
            <h3 className="text-lg uppercase font-semibold mb-4">
              Informações do Cargo
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <InfoField
                label="Nome"
                value={position.name}
                showCopyButton
                copyTooltip="Copiar nome"
              />
              <InfoField
                label="Código"
                value={position.code}
                showCopyButton
                copyTooltip="Copiar código"
              />
              <InfoField
                label="Descrição"
                value={position.description}
                className="col-span-2"
              />
              <InfoField
                label="Departamento"
                value={getDepartmentWithCompany()}
                icon={<Building2 className="h-4 w-4" />}
                className="col-span-2"
              />
              <InfoField
                label="Nível"
                value={formatLevel(position.level)}
                icon={<Layers className="h-4 w-4" />}
                badge={
                  <Badge variant={position.isActive ? 'success' : 'secondary'}>
                    {position.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                }
              />
              <InfoField
                label="Faixa Salarial"
                value={getSalaryRange(position)}
                icon={<DollarSign className="h-4 w-4" />}
              />
            </div>
          </Card>

          {/* Metadados */}
          <MetadataSection
            createdAt={position.createdAt}
            updatedAt={position.updatedAt}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
