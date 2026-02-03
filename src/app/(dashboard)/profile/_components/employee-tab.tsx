'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Employee } from '@/types/hr';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BadgeCheck,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  FileText,
  Hash,
  MapPin,
  User,
  Users,
} from 'lucide-react';

interface EmployeeTabProps {
  employee: Employee;
  isLoading?: boolean;
}

export function EmployeeTab({ employee, isLoading }: EmployeeTabProps) {
  if (isLoading) {
    return <EmployeeTabSkeleton />;
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-600 border-green-500/20',
    INACTIVE: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    ON_LEAVE: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    TERMINATED: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    ON_LEAVE: 'Afastado',
    TERMINATED: 'Desligado',
  };

  const contractTypeLabels: Record<string, string> = {
    CLT: 'CLT',
    PJ: 'Pessoa Jurídica',
    TEMPORARY: 'Temporário',
    INTERN: 'Estagiário',
    APPRENTICE: 'Aprendiz',
  };

  const workRegimeLabels: Record<string, string> = {
    ON_SITE: 'Presencial',
    REMOTE: 'Remoto',
    HYBRID: 'Híbrido',
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {employee.fullName}
              </h2>
              <p className="text-gray-600 dark:text-white/60">
                {employee.position?.name || 'Cargo não definido'}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={statusColors[employee.status || 'ACTIVE']}
          >
            <BadgeCheck className="w-3 h-3 mr-1" />
            {statusLabels[employee.status || 'ACTIVE']}
          </Badge>
        </div>
      </Card>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Information */}
        <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Informações de Trabalho
            </h3>
          </div>
          <div className="space-y-4">
            <InfoItem
              icon={<Hash className="w-4 h-4" />}
              label="Matrícula"
              value={employee.registrationNumber}
            />
            <InfoItem
              icon={<Building2 className="w-4 h-4" />}
              label="Empresa"
              value={
                employee.company?.tradeName ||
                employee.company?.legalName ||
                'Não definida'
              }
            />
            <InfoItem
              icon={<Users className="w-4 h-4" />}
              label="Departamento"
              value={employee.department?.name || 'Não definido'}
            />
            <InfoItem
              icon={<Briefcase className="w-4 h-4" />}
              label="Cargo"
              value={employee.position?.name || 'Não definido'}
            />
          </div>
        </Card>

        {/* Contract Information */}
        <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Contrato
            </h3>
          </div>
          <div className="space-y-4">
            <InfoItem
              icon={<FileText className="w-4 h-4" />}
              label="Tipo de Contrato"
              value={
                contractTypeLabels[employee.contractType] ||
                employee.contractType
              }
            />
            <InfoItem
              icon={<MapPin className="w-4 h-4" />}
              label="Regime de Trabalho"
              value={
                workRegimeLabels[employee.workRegime] || employee.workRegime
              }
            />
            <InfoItem
              icon={<Clock className="w-4 h-4" />}
              label="Carga Horária"
              value={`${employee.weeklyHours}h semanais`}
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Data de Admissão"
              value={format(
                new Date(employee.hireDate),
                "dd 'de' MMMM 'de' yyyy",
                { locale: ptBR }
              )}
            />
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Dados Pessoais
            </h3>
          </div>
          <div className="space-y-4">
            <InfoItem
              icon={<User className="w-4 h-4" />}
              label="Nome Completo"
              value={employee.fullName}
            />
            {employee.socialName && (
              <InfoItem
                icon={<User className="w-4 h-4" />}
                label="Nome Social"
                value={employee.socialName}
              />
            )}
            {employee.birthDate && (
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="Data de Nascimento"
                value={format(
                  new Date(employee.birthDate),
                  "dd 'de' MMMM 'de' yyyy",
                  { locale: ptBR }
                )}
              />
            )}
            <InfoItem
              icon={<FileText className="w-4 h-4" />}
              label="CPF"
              value={formatCPF(employee.cpf)}
              masked
            />
          </div>
        </Card>

        {/* Financial Information - Only show basic info for self-service */}
        <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Banknote className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Informações Financeiras
            </h3>
          </div>
          <div className="space-y-4">
            <InfoItem
              icon={<Banknote className="w-4 h-4" />}
              label="Salário Base"
              value={formatCurrency(employee.baseSalary)}
            />
            {employee.pis && (
              <InfoItem
                icon={<FileText className="w-4 h-4" />}
                label="PIS"
                value={employee.pis}
                masked
              />
            )}
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-white/40">
            Para mais detalhes sobre seus contracheques, consulte o RH.
          </p>
        </Card>
      </div>

      {/* Metadata */}
      <Card className="p-4 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-white/40">
          <span>
            Cadastro criado em:{' '}
            {format(new Date(employee.createdAt), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </span>
          {employee.updatedAt && (
            <span>
              Última atualização:{' '}
              {format(new Date(employee.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  masked?: boolean;
}

function InfoItem({ icon, label, value, masked }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 dark:text-white/40 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-white/50">{label}</p>
        <p
          className={`text-sm font-medium text-gray-900 dark:text-white ${masked ? 'font-mono' : ''}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function EmployeeTabSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="flex gap-3">
                  <Skeleton className="w-4 h-4" />
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
