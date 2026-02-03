/**
 * Company Detail Page - Simplified Layout
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { departmentsService } from '@/services/hr/departments.service';
import { employeesService } from '@/services/hr/employees.service';
import type {
  Company,
  CompanyAddress,
  CompanyCnae,
  CompanyFiscalSettings,
  CompanyStakeholder,
  Department,
  Employee,
} from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Edit,
  FileText,
  Trash,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  companiesApi,
  companyAddressesApi,
  companyCnaesApi,
  companyFiscalSettingsApi,
  companyStakeholdersApi,
} from '../src';
import { CnaesTab } from '../src/components/cnaes-tab';
import { FiscalTab } from '../src/components/fiscal-tab';
import { GeneralTab } from '../src/components/general-tab';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [activeTab, setActiveTab] = useState('general');

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['companies', companyId],
    queryFn: async () => {
      const result = await companiesApi.get(companyId);
      if (result && typeof result === 'object' && 'id' in result) {
        return result as Company;
      }
      throw new Error('Estrutura de resposta inválida');
    },
  });

  const { data: addresses, isLoading: isLoadingAddresses } = useQuery<
    CompanyAddress[]
  >({
    queryKey: ['companies', companyId, 'addresses'],
    queryFn: async () => {
      const response = await companyAddressesApi.list(companyId);
      return response.addresses;
    },
    enabled: !!companyId,
  });

  const { data: cnaes, isLoading: isLoadingCnaes } = useQuery<CompanyCnae[]>({
    queryKey: ['companies', companyId, 'cnaes'],
    queryFn: async () => {
      const response = await companyCnaesApi.list(companyId, { perPage: 50 });
      const items =
        (response as unknown as { cnaes?: CompanyCnae[] })?.cnaes ??
        (Array.isArray(response) ? response : []);
      return items as CompanyCnae[];
    },
    enabled: !!companyId,
  });

  const { data: stakeholders, isLoading: isLoadingStakeholders } = useQuery<
    CompanyStakeholder[]
  >({
    queryKey: ['companies', companyId, 'stakeholders'],
    queryFn: async () => {
      try {
        const response = await companyStakeholdersApi.list(companyId, {
          includeInactive: true,
        });
        const items =
          (response as unknown as { stakeholders?: CompanyStakeholder[] })
            ?.stakeholders ?? (Array.isArray(response) ? response : []);
        return items as CompanyStakeholder[];
      } catch (error) {
        // Se der erro (ex: 404), retorna array vazio
        return [];
      }
    },
    enabled: !!companyId,
    throwOnError: false,
    retry: false,
  });

  const { data: fiscalSettings, isLoading: isLoadingFiscal } =
    useQuery<CompanyFiscalSettings | null>({
      queryKey: ['companies', companyId, 'fiscal-settings'],
      queryFn: async () => {
        try {
          const response = await companyFiscalSettingsApi.get(companyId);
          if (response && 'id' in response)
            return response as CompanyFiscalSettings;

          const typedResponse = response as unknown as {
            fiscalSettings?: CompanyFiscalSettings;
          };

          if (typedResponse?.fiscalSettings) {
            return typedResponse.fiscalSettings;
          }

          return null;
        } catch (error) {
          // Se der erro (ex: 404), retorna null
          return null;
        }
      },
      enabled: !!companyId,
      throwOnError: false,
      retry: false,
    });

  // Buscar departamentos desta empresa
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'by-company', companyId],
    queryFn: async () => {
      const response = await departmentsService.listDepartments({
        companyId,
        perPage: 50,
      });
      return response.departments;
    },
    enabled: !!companyId,
  });

  // Buscar funcionários desta empresa
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'by-company', companyId],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        companyId,
        perPage: 50,
      });
      return response.employees;
    },
    enabled: !!companyId,
  });

  const departments = departmentsData || [];
  const employees = employeesData || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando dados da empresa...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Empresa não encontrada.</p>
      </div>
    );
  }

  const handleBack = () => {
    router.push('/hr/companies');
  };
  const handleDelete = (companyId: string) => {
    router.push(`/hr/companies/${companyId}`);
  };
  const handleEdit = (companyId: string) => {
    router.push(`/hr/companies/${companyId}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-8xl  flex items-center gap-4  mb-2">
          <Button variant="ghost" size={'sm'} onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
            Voltar para empresas
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size={'sm'}
            onClick={() => handleDelete(company.id)}
            className="gap-2 self-start sm:self-auto"
          >
            <Trash className="h-4 w-4 text-red-800" />
            Excluir
          </Button>

          <Button
            variant="outline"
            size={'sm'}
            onClick={() => handleEdit(company.id)}
            className="gap-2 self-start sm:self-auto"
          >
            <Edit className="h-4 w-4  text-sky-500" />
            Editar
          </Button>
        </div>
      </div>

      {/* Company Info Card */}
      <Card className="p-4 sm:p-6 ">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shrink-0">
            <Building2 className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {company.legalName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {company.tradeName || 'Sem nome fantasia'}
              </p>
            </div>
            <div>
              <Badge variant="success" className="mt-1">
                {company.status}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4 p-2 h-12 ">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4 hidden sm:inline" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4 hidden sm:inline" />
            <span>Equipe</span>
            <Badge variant="secondary" className="ml-1 hidden sm:inline">
              {departments.length + employees.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cnaes" className="gap-2">
            <FileText className="h-4 w-4 hidden sm:inline" />
            <span>CNAEs</span>
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="gap-2">
            <FileText className="h-4 w-4 hidden sm:inline" />
            <span>Fiscal</span>
          </TabsTrigger>
        </TabsList>

        <GeneralTab
          company={company}
          addresses={addresses}
          isLoadingAddresses={isLoadingAddresses}
          stakeholders={stakeholders}
          isLoadingStakeholders={isLoadingStakeholders}
        />

        {/* Aba Equipe */}
        <TabsContent value="team" className="space-y-6 flex flex-col">
          {/* Departamentos */}
          <Card className="p-4 w-full sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg uppercase font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Departamentos
                <Badge variant="secondary" className="ml-2">
                  {departments.length}
                </Badge>
              </h3>
              <Link href={`/hr/departments?companyId=${companyId}`}>
                <Button variant="outline" size="sm">
                  Ver todos
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            {departments.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                Nenhum departamento nesta empresa.
              </p>
            ) : (
              <div className="space-y-2">
                {departments.slice(0, 5).map((department: Department) => (
                  <Link
                    key={department.id}
                    href={`/hr/departments/${department.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{department.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {department._count?.positions ?? 0} cargo(s) •{' '}
                          {department._count?.employees ?? 0} funcionário(s)
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
                {departments.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    + {departments.length - 5} outros departamentos
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Funcionários */}
          <Card className="p-4 sm:p-6 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg uppercase font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Funcionários
                <Badge variant="secondary" className="ml-2">
                  {employees.length}
                </Badge>
              </h3>
              <Link href={`/hr/employees?companyId=${companyId}`}>
                <Button variant="outline" size="sm">
                  Ver todos
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            {employees.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                Nenhum funcionário nesta empresa.
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
                          {employee.department?.name || 'Sem departamento'}
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
        </TabsContent>

        <CnaesTab cnaes={cnaes} isLoadingCnaes={isLoadingCnaes} />

        <FiscalTab
          fiscalSettings={fiscalSettings}
          isLoadingFiscal={isLoadingFiscal}
        />
      </Tabs>
    </div>
  );
}
