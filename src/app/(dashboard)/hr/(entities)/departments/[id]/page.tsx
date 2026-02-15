/**
 * OpenSea OS - Department Detail Page
 * Página de detalhes de um departamento específico seguindo padrão de companies
 */

'use client';

import { companiesApi } from '@/app/(dashboard)/hr/(entities)/companies/src/api';
import { InfoField } from '@/components/shared/info-field';
import { MetadataSection } from '@/components/shared/metadata-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCNPJ } from '@/helpers';
import { employeesService } from '@/services/hr/employees.service';
import { positionsService } from '@/services/hr/positions.service';
import { logger } from '@/lib/logger';
import type { Company, Department, Employee, Position } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Edit,
  Factory,
  NotebookText,
  Trash,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { departmentsApi, deleteDepartment } from '../src';

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const departmentId = params.id as string;

  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: department, isLoading } = useQuery<Department>({
    queryKey: ['departments', departmentId],
    queryFn: async () => {
      return departmentsApi.get(departmentId);
    },
  });

  // Busca a empresa vinculada ao departamento separadamente
  const { data: company, isLoading: isLoadingCompany } =
    useQuery<Company | null>({
      queryKey: ['companies', department?.companyId],
      queryFn: async () => {
        if (!department?.companyId) return null;
        try {
          return await companiesApi.get(department.companyId);
        } catch {
          return null;
        }
      },
      enabled: !!department?.companyId,
    });

  // Buscar cargos deste departamento
  const { data: positionsData } = useQuery({
    queryKey: ['positions', 'by-department', departmentId],
    queryFn: async () => {
      const response = await positionsService.listPositions({
        departmentId,
        perPage: 50,
      });
      return response.positions;
    },
    enabled: !!departmentId,
  });

  // Buscar funcionários deste departamento
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'by-department', departmentId],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        departmentId,
        perPage: 50,
      });
      return response.employees;
    },
    enabled: !!departmentId,
  });

  const positions = positionsData || [];
  const employees = employeesData || [];

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/hr/departments');
  };

  const handleEdit = () => {
    router.push(`/hr/departments/${departmentId}/edit`);
  };

  const handleDelete = async () => {
    if (!department) return;

    if (
      !confirm(
        `Tem certeza que deseja excluir o departamento "${department.name}"?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDepartment(department.id);
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento excluído com sucesso!');
      router.push('/hr/departments');
    } catch (error) {
      logger.error(
        'Erro ao excluir departamento',
        error instanceof Error ? error : undefined
      );
      toast.error('Erro ao excluir departamento');
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Carregando dados do departamento...
        </p>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Departamento não encontrado.</p>
      </div>
    );
  }

  // Empresa vinculada (pode vir do department.company ou da query separada)
  const linkedCompany = department.company || company;
  const companyName = linkedCompany?.tradeName || linkedCompany?.legalName;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-8xl flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
            Voltar para Departamentos
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 self-start sm:self-auto"
          >
            <Trash className="h-4 w-4 text-red-800" />
            Excluir
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="gap-2 self-start sm:self-auto"
          >
            <Edit className="h-4 w-4 text-sky-500" />
            Editar
          </Button>
        </div>
      </div>

      {/* Department Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 shrink-0">
            <Building2 className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {department.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Código: {department.code}
              </p>
            </div>
            <div>
              <Badge
                variant={department.isActive ? 'success' : 'secondary'}
                className="mt-1"
              >
                {department.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Dados do Departamento */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
          <NotebookText className="h-5 w-5" />
          Dados do Departamento
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <InfoField
            label="Nome"
            value={department.name}
            showCopyButton
            copyTooltip="Copiar Nome"
          />
          <InfoField
            label="Código"
            value={department.code}
            showCopyButton
            copyTooltip="Copiar Código"
          />
          <InfoField
            label="Status"
            value={department.isActive ? 'Ativo' : 'Inativo'}
            badge={
              <Badge variant={department.isActive ? 'success' : 'secondary'}>
                {department.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            }
          />
        </div>
        {department.description && (
          <div className="mt-6">
            <InfoField
              label="Descrição"
              value={department.description}
              showCopyButton
              copyTooltip="Copiar Descrição"
            />
          </div>
        )}
      </Card>

      {/* Empresa Vinculada */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
          <Factory className="h-5 w-5" />
          Empresa
        </h3>
        {isLoadingCompany ? (
          <p className="text-muted-foreground">Carregando empresa...</p>
        ) : linkedCompany ? (
          <Link
            href={`/hr/companies/${linkedCompany.id}`}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shrink-0">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-lg">{companyName}</p>
                <p className="text-sm text-muted-foreground">
                  CNPJ:{' '}
                  {linkedCompany.cnpj
                    ? formatCNPJ(linkedCompany.cnpj)
                    : 'Não informado'}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Nenhuma empresa vinculada.
          </p>
        )}
      </Card>

      {/* Cargos */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg uppercase font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Cargos neste Departamento
            <Badge variant="secondary" className="ml-2">
              {positions.length}
            </Badge>
          </h3>
          <Link href={`/hr/positions?departmentId=${departmentId}`}>
            <Button variant="outline" size="sm">
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {positions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">
            Nenhum cargo neste departamento.
          </p>
        ) : (
          <div className="space-y-2">
            {positions.slice(0, 5).map((position: Position) => (
              <Link
                key={position.id}
                href={`/hr/positions/${position.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{position.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {position._count?.employees ?? 0} funcionário(s)
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
            {positions.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                + {positions.length - 5} outros cargos
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Funcionários */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg uppercase font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funcionários neste Departamento
            <Badge variant="secondary" className="ml-2">
              {employees.length}
            </Badge>
          </h3>
          <Link href={`/hr/employees?departmentId=${departmentId}`}>
            <Button variant="outline" size="sm">
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {employees.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">
            Nenhum funcionário neste departamento.
          </p>
        ) : (
          <div className="space-y-2">
            {employees.slice(0, 5).map((employee: Employee) => (
              <Link
                key={employee.id}
                href={`/hr/employees/${employee.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                    {employee.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{employee.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.position?.name || 'Sem cargo'} •{' '}
                      {employee.registrationNumber}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
            {employees.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                + {employees.length - 5} outros funcionários
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Metadados */}
      <MetadataSection
        createdAt={department.createdAt}
        updatedAt={department.updatedAt}
      />
    </div>
  );
}
