/**
 * OpenSea OS - Employee Edit Page
 * Página de edição de um funcionário específico
 */

'use client';

import { companiesApi } from '@/app/(dashboard)/hr/companies/src';
import { departmentsApi } from '@/app/(dashboard)/hr/departments/src';
import { positionsApi } from '@/app/(dashboard)/hr/positions/src';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Company, Department, Employee, Position } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Loader2,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { employeesApi, getStatusLabel } from '../../src';

export default function EmployeeEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const employeeId = params.id as string;

  // Estados de seletores
  const [showDepartmentSelector, setShowDepartmentSelector] = useState(false);
  const [showPositionSelector, setShowPositionSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de edição
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [fullName, setFullName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [cpf, setCpf] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [baseSalary, setBaseSalary] = useState<string>('');
  const [contractType, setContractType] = useState<string>('CLT');
  const [workRegime, setWorkRegime] = useState<string>('FULL_TIME');
  const [weeklyHours, setWeeklyHours] = useState<string>('44');
  const [status, setStatus] = useState<string>('ACTIVE');
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ['employees', employeeId],
    queryFn: async () => {
      return employeesApi.get(employeeId);
    },
  });

  // Busca lista de departamentos para seleção
  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments', 'list'],
    queryFn: async () => {
      const response = await departmentsApi.list();
      return response.departments.filter(
        (dept: Department) => !dept.deletedAt && dept.isActive
      );
    },
    enabled: showDepartmentSelector,
  });

  // Busca lista de empresas para merge
  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies', 'list'],
    queryFn: async () => {
      const response = await companiesApi.list();
      return response.companies;
    },
    enabled: showDepartmentSelector,
  });

  // Busca lista de cargos para seleção
  const { data: positionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['positions', 'list'],
    queryFn: async () => {
      const response = await positionsApi.list();
      return response.positions.filter(
        (pos: Position) => !pos.deletedAt && pos.isActive
      );
    },
    enabled: showPositionSelector,
  });

  // Merge departamentos com empresas
  const departments = useMemo(() => {
    const depts = departmentsData || [];
    const companies = companiesData || [];

    const companiesMap = new Map<string, Company>();
    companies.forEach(company => {
      companiesMap.set(company.id, company);
    });

    return depts.map(dept => {
      if (!dept.company && dept.companyId) {
        const company = companiesMap.get(dept.companyId);
        if (company) {
          return { ...dept, company };
        }
      }
      return dept;
    });
  }, [departmentsData, companiesData]);

  const positions = positionsData || [];

  // Filtro de departamentos
  const filteredDepartments = departments.filter(department => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const companyName =
      department.company?.tradeName || department.company?.legalName || '';
    return (
      department.name.toLowerCase().includes(query) ||
      department.code.toLowerCase().includes(query) ||
      companyName.toLowerCase().includes(query)
    );
  });

  // Filtro de cargos
  const filteredPositions = positions.filter(position => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      position.name.toLowerCase().includes(query) ||
      position.code.toLowerCase().includes(query)
    );
  });

  // Sincroniza os estados com o employee quando carrega
  useEffect(() => {
    if (employee) {
      setFullName(employee.fullName);
      setRegistrationNumber(employee.registrationNumber);
      setCpf(employee.cpf);
      setHireDate(employee.hireDate?.split('T')[0] || '');
      setBaseSalary(employee.baseSalary?.toString() || '');
      setContractType(employee.contractType || 'CLT');
      setWorkRegime(employee.workRegime || 'FULL_TIME');
      setWeeklyHours(employee.weeklyHours?.toString() || '44');
      setStatus(employee.status || 'ACTIVE');
      if (employee.department) {
        setSelectedDepartment(employee.department);
      }
      if (employee.position) {
        setSelectedPosition(employee.position);
      }
    }
  }, [employee]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getDepartmentDisplayName = (dept: Department) => {
    const companyName = dept.company?.tradeName || dept.company?.legalName;
    if (companyName) {
      return `${dept.name} - ${companyName}`;
    }
    return dept.name;
  };

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

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push(`/hr/employees/${employeeId}`);
  };

  const handleCancel = () => {
    router.push(`/hr/employees/${employeeId}`);
  };

  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowDepartmentSelector(false);
    setSearchQuery('');
  };

  const handleSelectPosition = (position: Position) => {
    setSelectedPosition(position);
    setShowPositionSelector(false);
    setSearchQuery('');
  };

  const handleSave = async () => {
    if (!employee || !fullName || !registrationNumber || !cpf) return;

    setIsSaving(true);
    try {
      await employeesApi.update(employeeId, {
        fullName,
        registrationNumber,
        cpf,
        hireDate,
        baseSalary: baseSalary ? parseFloat(baseSalary) : undefined,
        contractType: contractType as
          | 'CLT'
          | 'PJ'
          | 'INTERN'
          | 'TEMPORARY'
          | 'APPRENTICE',
        workRegime: workRegime as
          | 'FULL_TIME'
          | 'PART_TIME'
          | 'HOURLY'
          | 'SHIFT'
          | 'FLEXIBLE',
        weeklyHours: weeklyHours ? parseInt(weeklyHours) : undefined,
        status,
        departmentId: selectedDepartment?.id || employee.departmentId,
        positionId: selectedPosition?.id || employee.positionId,
        companyId: selectedDepartment?.companyId || employee.companyId,
      });
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Funcionário atualizado com sucesso!');
      router.push(`/hr/employees/${employeeId}`);
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      toast.error('Erro ao salvar funcionário');
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
          Carregando dados do funcionário...
        </p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Funcionário não encontrado.</p>
      </div>
    );
  }

  const departmentName = selectedDepartment
    ? getDepartmentDisplayName(selectedDepartment)
    : null;

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

      {/* Employee Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shrink-0">
            <Users className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                Editar Funcionário
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {employee.fullName} - {employee.registrationNumber}
              </p>
            </div>
            <div>
              <Badge
                variant={getStatusVariant(employee.status)}
                className="mt-1"
              >
                {getStatusLabel(employee.status)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Seletor de Departamento */}
      {showDepartmentSelector ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Selecionar Departamento</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDepartmentSelector(false);
                  setSearchQuery('');
                }}
              >
                Cancelar
              </Button>
            </div>

            {/* Barra de pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar departamento por nome, código ou empresa..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Lista de departamentos */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {isLoadingDepartments || isLoadingCompanies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredDepartments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'Nenhum departamento encontrado'
                    : 'Nenhum departamento cadastrado'}
                </div>
              ) : (
                filteredDepartments.map(department => (
                  <Card
                    key={department.id}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectDepartment(department)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 shrink-0">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {department.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {department.company?.tradeName ||
                            department.company?.legalName ||
                            department.code}
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
      ) : showPositionSelector ? (
        /* Seletor de Cargo */
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Selecionar Cargo</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPositionSelector(false);
                  setSearchQuery('');
                }}
              >
                Cancelar
              </Button>
            </div>

            {/* Barra de pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cargo por nome ou código..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Lista de cargos */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {isLoadingPositions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredPositions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'Nenhum cargo encontrado'
                    : 'Nenhum cargo cadastrado'}
                </div>
              ) : (
                filteredPositions.map(position => (
                  <Card
                    key={position.id}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectPosition(position)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 shrink-0">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{position.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {position.code}
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
          {/* Departamento e Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Departamento */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Departamento</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 shrink-0">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {departmentName || 'Nenhum departamento selecionado'}
                  </p>
                  {selectedDepartment?.code && (
                    <p className="text-sm text-muted-foreground">
                      {selectedDepartment.code}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDepartmentSelector(true)}
                >
                  Alterar
                </Button>
              </div>
            </Card>

            {/* Cargo */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cargo</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 shrink-0">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {selectedPosition?.name || 'Nenhum cargo selecionado'}
                  </p>
                  {selectedPosition?.code && (
                    <p className="text-sm text-muted-foreground">
                      {selectedPosition.code}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPositionSelector(true)}
                >
                  Alterar
                </Button>
              </div>
            </Card>
          </div>

          {/* Dados Pessoais */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    placeholder="Ex: João da Silva"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Matrícula *</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="Ex: 00001"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    placeholder="Ex: 000.000.000-00"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="INACTIVE">Inativo</SelectItem>
                      <SelectItem value="ON_LEAVE">Em Licença</SelectItem>
                      <SelectItem value="TERMINATED">Desligado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Dados Contratuais */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados Contratuais</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Data de Admissão</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={hireDate}
                    onChange={e => setHireDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractType">Tipo de Contrato</Label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger id="contractType">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                      <SelectItem value="INTERN">Estagiário</SelectItem>
                      <SelectItem value="TEMPORARY">Temporário</SelectItem>
                      <SelectItem value="APPRENTICE">Aprendiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workRegime">Regime de Trabalho</Label>
                  <Select value={workRegime} onValueChange={setWorkRegime}>
                    <SelectTrigger id="workRegime">
                      <SelectValue placeholder="Selecione o regime" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Tempo Integral</SelectItem>
                      <SelectItem value="PART_TIME">Meio Período</SelectItem>
                      <SelectItem value="HOURLY">Por Hora</SelectItem>
                      <SelectItem value="SHIFT">Turnos</SelectItem>
                      <SelectItem value="FLEXIBLE">Flexível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Salário Base</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    placeholder="Ex: 3000"
                    value={baseSalary}
                    onChange={e => setBaseSalary(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weeklyHours">Horas Semanais</Label>
                  <Input
                    id="weeklyHours"
                    type="number"
                    placeholder="Ex: 44"
                    value={weeklyHours}
                    onChange={e => setWeeklyHours(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
