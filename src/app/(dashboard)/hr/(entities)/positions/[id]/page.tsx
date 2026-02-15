/**
 * OpenSea OS - Position Detail Page
 * Página de detalhes de um cargo específico
 */

'use client';

import { InfoField } from '@/components/shared/info-field';
import { MetadataSection } from '@/components/shared/metadata-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { employeesService } from '@/services/hr/employees.service';
import type { Employee, Position } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  DollarSign,
  Edit,
  Factory,
  Layers,
  Trash,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatLevel, getSalaryRange, positionsApi } from '../src';

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: position, isLoading } = useQuery<Position>({
    queryKey: ['positions', positionId],
    queryFn: async () => {
      return positionsApi.get(positionId);
    },
  });

  // Buscar funcionários deste cargo
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'by-position', positionId],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        positionId,
        perPage: 50,
      });
      return response.employees;
    },
    enabled: !!positionId,
  });

  const employees = employeesData || [];

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/hr/positions');
  };

  const handleEdit = () => {
    router.push(`/hr/positions/${positionId}/edit`);
  };

  const handleDelete = () => {
    // TODO: Implement delete
    router.push(`/hr/positions/${positionId}`);
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getDepartmentWithCompany = () => {
    if (!position?.department) return null;
    const companyName =
      position.department.company?.tradeName ||
      position.department.company?.legalName;
    if (companyName) {
      return `${position.department.name} - ${companyName}`;
    }
    return position.department.name;
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando dados do cargo...</p>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Cargo não encontrado.</p>
      </div>
    );
  }

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
            Voltar para Cargos
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
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

      {/* Position Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 shrink-0">
            <Briefcase className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {position.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Código: {position.code}
              </p>
            </div>
            <div>
              <Badge
                variant={position.isActive ? 'success' : 'secondary'}
                className="mt-1"
              >
                {position.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Informações do Cargo */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg uppercase font-semibold mb-4">
          Informações do Cargo
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
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
            className="md:col-span-2"
          />
          <InfoField
            label="Nível"
            value={formatLevel(position.level)}
            icon={<Layers className="h-4 w-4" />}
          />
          <InfoField
            label="Faixa Salarial"
            value={getSalaryRange(position)}
            icon={<DollarSign className="h-4 w-4" />}
          />
        </div>
      </Card>

      {/* Hierarquia */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg uppercase font-semibold mb-4">
          Hierarquia Organizacional
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {position.department && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departamento
              </p>
              <Link
                href={`/hr/departments/${position.department.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
              >
                <span className="font-medium">{position.department.name}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </div>
          )}
          {position.department?.company && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Empresa
              </p>
              <Link
                href={`/hr/companies/${position.department.company.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
              >
                <span className="font-medium">
                  {position.department.company.tradeName ||
                    position.department.company.legalName}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Funcionários */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg uppercase font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funcionários neste Cargo
            <Badge variant="secondary" className="ml-2">
              {employees.length}
            </Badge>
          </h3>
          <Link href={`/hr/employees?positionId=${positionId}`}>
            <Button variant="outline" size="sm">
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {employees.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">
            Nenhum funcionário neste cargo.
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
        createdAt={position.createdAt}
        updatedAt={position.updatedAt}
      />
    </div>
  );
}
