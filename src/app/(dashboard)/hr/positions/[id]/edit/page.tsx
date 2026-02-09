/**
 * OpenSea OS - Position Edit Page
 * Página de edição de um cargo específico
 */

'use client';

import { departmentsApi } from '@/app/(dashboard)/hr/departments/src';
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
import { Switch } from '@/components/ui/switch';
import { logger } from '@/lib/logger';
import type { Department, Position } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { positionsApi } from '../../src';

export default function PositionEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const positionId = params.id as string;

  // Estados de edição
  const [showDepartmentSelector, setShowDepartmentSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [positionName, setPositionName] = useState('');
  const [positionCode, setPositionCode] = useState('');
  const [positionDescription, setPositionDescription] = useState('');
  const [positionLevel, setPositionLevel] = useState<number>(1);
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: position, isLoading } = useQuery<Position>({
    queryKey: ['positions', positionId],
    queryFn: async () => {
      return positionsApi.get(positionId);
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

  const departments = departmentsData || [];

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

  // Sincroniza os estados com o position quando carrega
  useEffect(() => {
    if (position) {
      setPositionName(position.name);
      setPositionCode(position.code);
      setPositionDescription(position.description || '');
      setPositionLevel(position.level || 1);
      setMinSalary(position.minSalary?.toString() || '');
      setMaxSalary(position.maxSalary?.toString() || '');
      setIsActive(position.isActive);
      if (position.department) {
        setSelectedDepartment(position.department);
      }
    }
  }, [position]);

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

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push(`/hr/positions/${positionId}`);
  };

  const handleCancel = () => {
    router.push(`/hr/positions/${positionId}`);
  };

  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowDepartmentSelector(false);
    setSearchQuery('');
  };

  const handleSave = async () => {
    if (!position || !positionName || !positionCode) return;

    setIsSaving(true);
    try {
      await positionsApi.update(positionId, {
        name: positionName,
        code: positionCode,
        description: positionDescription || undefined,
        departmentId: selectedDepartment?.id || position.departmentId,
        level: positionLevel,
        minSalary: minSalary ? parseFloat(minSalary) : undefined,
        maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
        isActive,
      });
      await queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Cargo atualizado com sucesso!');
      router.push(`/hr/positions/${positionId}`);
    } catch (error) {
      logger.error(
        'Erro ao salvar cargo',
        error instanceof Error ? error : undefined
      );
      toast.error('Erro ao salvar cargo');
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

      {/* Position Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 shrink-0">
            <Briefcase className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                Editar Cargo
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {position.name} - {position.code}
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

      {/* Department Selection */}
      {showDepartmentSelector ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Selecionar Departamento</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDepartmentSelector(false)}
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
              {isLoadingDepartments ? (
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
      ) : (
        <>
          {/* Departamento */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Departamento Vinculado
            </h3>
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

          {/* Dados Cadastrais */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados do Cargo</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Gerente de Vendas"
                    value={positionName}
                    onChange={e => setPositionName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    placeholder="Ex: GER-VEN"
                    value={positionCode}
                    onChange={e =>
                      setPositionCode(e.target.value.toUpperCase())
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição do cargo (opcional)"
                  value={positionDescription}
                  onChange={e => setPositionDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Nível</Label>
                  <Select
                    value={positionLevel.toString()}
                    onValueChange={value => setPositionLevel(parseInt(value))}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Júnior</SelectItem>
                      <SelectItem value="2">Pleno</SelectItem>
                      <SelectItem value="3">Sênior</SelectItem>
                      <SelectItem value="4">Especialista</SelectItem>
                      <SelectItem value="5">Gerente</SelectItem>
                      <SelectItem value="6">Diretor</SelectItem>
                      <SelectItem value="7">Executivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minSalary">Salário Mínimo</Label>
                  <Input
                    id="minSalary"
                    type="number"
                    placeholder="Ex: 3000"
                    value={minSalary}
                    onChange={e => setMinSalary(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSalary">Salário Máximo</Label>
                  <Input
                    id="maxSalary"
                    type="number"
                    placeholder="Ex: 5000"
                    value={maxSalary}
                    onChange={e => setMaxSalary(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Cargo ativo' : 'Cargo inativo'}
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
