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
import type { Employee } from '@/types/hr';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Edit,
  FileText,
  Hash,
  User,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  formatCPF,
  formatSalary,
  getCompanyTime,
  getContractTypeLabel,
  getStatusLabel,
  getWorkRegimeLabel,
} from '../utils';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export function ViewModal({ isOpen, onClose, employee }: ViewModalProps) {
  const router = useRouter();

  if (!employee) return null;

  // Função auxiliar para mostrar departamento com empresa
  const getDepartmentWithCompany = () => {
    if (!employee.department) return null;
    const companyName =
      employee.department.company?.tradeName ||
      employee.department.company?.legalName ||
      employee.company?.tradeName ||
      employee.company?.legalName;
    if (companyName) {
      return `${employee.department.name} - ${companyName}`;
    }
    return employee.department.name;
  };

  // Função para obter a cor do badge de status
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'ON_LEAVE':
        return 'warning';
      case 'TERMINATED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">Funcionário</span>
                {employee.fullName.length > 20
                  ? `${employee.fullName.substring(0, 20)}...`
                  : employee.fullName}
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
                    router.push(`/hr/employees/${employee.id}/edit`);
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
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <InfoField
                label="Nome Completo"
                value={employee.fullName}
                icon={<User className="h-4 w-4" />}
                showCopyButton
                copyTooltip="Copiar nome"
              />
              <InfoField
                label="Matrícula"
                value={employee.registrationNumber}
                icon={<Hash className="h-4 w-4" />}
                showCopyButton
                copyTooltip="Copiar matrícula"
              />
              <InfoField
                label="CPF"
                value={formatCPF(employee.cpf)}
                icon={<CreditCard className="h-4 w-4" />}
                showCopyButton
                copyTooltip="Copiar CPF"
              />
              <InfoField
                label="Status"
                value={getStatusLabel(employee.status)}
                badge={
                  <Badge variant={getStatusVariant(employee.status)}>
                    {getStatusLabel(employee.status)}
                  </Badge>
                }
              />
            </div>
          </Card>

          {/* Informações Profissionais */}
          <Card className="p-6">
            <h3 className="text-lg uppercase font-semibold mb-4">
              Informações Profissionais
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <InfoField
                label="Departamento"
                value={getDepartmentWithCompany()}
                icon={<Building2 className="h-4 w-4" />}
                className="col-span-2"
              />
              {employee.position && (
                <InfoField
                  label="Cargo"
                  value={employee.position.name}
                  icon={<Briefcase className="h-4 w-4" />}
                />
              )}
              <InfoField
                label="Data de Admissão"
                value={new Date(employee.hireDate).toLocaleDateString('pt-BR')}
                icon={<Calendar className="h-4 w-4" />}
              />
              <InfoField
                label="Tempo de Empresa"
                value={getCompanyTime(employee.hireDate)}
                icon={<Clock className="h-4 w-4" />}
              />
              <InfoField
                label="Salário Base"
                value={formatSalary(employee.baseSalary)}
              />
            </div>
          </Card>

          {/* Informações Contratuais */}
          <Card className="p-6">
            <h3 className="text-lg uppercase font-semibold mb-4">
              Informações Contratuais
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <InfoField
                label="Tipo de Contrato"
                value={getContractTypeLabel(employee.contractType)}
                icon={<FileText className="h-4 w-4" />}
              />
              <InfoField
                label="Regime de Trabalho"
                value={getWorkRegimeLabel(employee.workRegime)}
              />
              <InfoField
                label="Horas Semanais"
                value={`${employee.weeklyHours}h`}
                icon={<Clock className="h-4 w-4" />}
              />
              {employee.terminationDate && (
                <InfoField
                  label="Data de Desligamento"
                  value={new Date(employee.terminationDate).toLocaleDateString(
                    'pt-BR'
                  )}
                  icon={<Calendar className="h-4 w-4" />}
                />
              )}
            </div>
          </Card>

          {/* Metadados */}
          <MetadataSection
            createdAt={employee.createdAt}
            updatedAt={employee.updatedAt}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
