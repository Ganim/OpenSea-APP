/**
 * OpenSea OS - Department Edit Page
 * Página de edição de um departamento específico
 */

'use client';

import { companiesApi } from '@/app/(dashboard)/hr/(entities)/companies/src/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { logger } from '@/lib/logger';
import type { Company, Department } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { departmentsApi } from '../../src';

export default function DepartmentEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const departmentId = params.id as string;

  // Estados de edição
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: department, isLoading } = useQuery<Department>({
    queryKey: ['departments', departmentId],
    queryFn: async () => {
      return departmentsApi.get(departmentId);
    },
  });

  // Busca a empresa vinculada ao departamento
  const { data: linkedCompany } = useQuery<Company | null>({
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

  // Busca lista de empresas para seleção
  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies', 'list'],
    queryFn: async () => {
      const response = await companiesApi.list({
        perPage: 100,
        includeDeleted: false,
      });
      const companies = Array.isArray(response)
        ? response
        : response?.companies || [];
      return companies.filter((company: Company) => !company.deletedAt);
    },
    enabled: showCompanySelector,
  });

  const companies = companiesData || [];

  const filteredCompanies = companies.filter(company => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      company.legalName.toLowerCase().includes(query) ||
      company.tradeName?.toLowerCase().includes(query) ||
      company.cnpj.includes(query)
    );
  });

  // Sincroniza os estados com o department quando carrega
  useEffect(() => {
    if (department) {
      setDepartmentName(department.name);
      setDepartmentCode(department.code);
      setDepartmentDescription(department.description || '');
      setIsActive(department.isActive);
    }
  }, [department]);

  // Sincroniza a empresa vinculada
  useEffect(() => {
    if (linkedCompany && !selectedCompany) {
      setSelectedCompany(linkedCompany);
    }
  }, [linkedCompany, selectedCompany]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push(`/hr/departments/${departmentId}`);
  };

  const handleCancel = () => {
    router.push(`/hr/departments/${departmentId}`);
  };

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanySelector(false);
    setSearchQuery('');
  };

  const handleSave = async () => {
    if (!department || !departmentName || !departmentCode) return;

    setIsSaving(true);
    try {
      await departmentsApi.update(departmentId, {
        name: departmentName,
        code: departmentCode,
        description: departmentDescription || undefined,
        companyId: selectedCompany?.id || department.companyId,
        isActive,
      });
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento atualizado com sucesso!');
      router.push(`/hr/departments/${departmentId}`);
    } catch (error) {
      logger.error(
        'Erro ao salvar departamento',
        error instanceof Error ? error : undefined
      );
      toast.error('Erro ao salvar departamento');
    } finally {
      setIsSaving(false);
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

  const companyName =
    selectedCompany?.tradeName || selectedCompany?.legalName || null;

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
            Voltar
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
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
                Editar Departamento
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {department.name} - {department.code}
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

      {/* Company Selection */}
      {showCompanySelector ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Selecionar Empresa</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompanySelector(false)}
              >
                Cancelar
              </Button>
            </div>

            {/* Barra de pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa por nome ou CNPJ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Lista de empresas */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {isLoadingCompanies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'Nenhuma empresa encontrada'
                    : 'Nenhuma empresa cadastrada'}
                </div>
              ) : (
                filteredCompanies.map(company => (
                  <Card
                    key={company.id}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectCompany(company)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shrink-0">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {company.tradeName || company.legalName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {company.cnpj}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Empresa */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Empresa Vinculada</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shrink-0">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {companyName || 'Nenhuma empresa selecionada'}
                </p>
                {selectedCompany?.cnpj && (
                  <p className="text-sm text-muted-foreground">
                    {selectedCompany.cnpj}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompanySelector(true)}
              >
                Alterar
              </Button>
            </div>
          </Card>

          {/* Dados Cadastrais */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Dados do Departamento
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Recursos Humanos"
                    value={departmentName}
                    onChange={e => setDepartmentName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    placeholder="Ex: RH"
                    value={departmentCode}
                    onChange={e =>
                      setDepartmentCode(e.target.value.toUpperCase())
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição do departamento (opcional)"
                  value={departmentDescription}
                  onChange={e => setDepartmentDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Departamento ativo' : 'Departamento inativo'}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
