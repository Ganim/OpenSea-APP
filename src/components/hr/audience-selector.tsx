'use client';

/**
 * AudienceSelector
 *
 * Notion/Slack-style audience selector for company announcements.
 * Reference: Notion "share with" picker + Slack channel composer.
 *
 * Lets the user broadcast to all employees or pick a precise audience by
 * combining Departments, Teams, Positions (roles) and individual Employees.
 *
 * The component computes a *client-side audience preview* by gathering:
 *   - employees in the chosen departments
 *   - employees in the chosen positions
 *   - explicitly chosen employees
 *
 * Teams are intentionally not de-duplicated against employees here, as
 * their members are user-based and may not always map to employees.
 * The backend re-resolves the audience precisely on create/update.
 */

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  departmentsService,
  employeesService,
  positionsService,
} from '@/services/hr';
import { teamsService } from '@/services/core/teams.service';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Building2,
  ChevronDown,
  Globe2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

export interface AudienceSelection {
  departments: string[];
  teams: string[];
  roles: string[];
  employees: string[];
}

export interface AudienceSelectorProps {
  value: AudienceSelection;
  onChange: (next: AudienceSelection) => void;
  /** When true, the entire tenant receives the announcement and the four pickers are disabled. */
  broadcastToAll: boolean;
  onBroadcastToAllChange: (next: boolean) => void;
  /** Optional className applied to the wrapper. */
  className?: string;
  /** Total tenant employees count (used by the broadcast preview). When omitted, the preview falls back to the resolved set. */
  tenantEmployeesCount?: number;
  /** data-testid for the wrapper element. */
  testId?: string;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const EMPTY_SELECTION: AudienceSelection = {
  departments: [],
  teams: [],
  roles: [],
  employees: [],
};

interface PickerOption {
  id: string;
  label: string;
  caption?: string;
  photoUrl?: string | null;
}

function getInitials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ----------------------------------------------------------------------------
// MultiPicker — single combobox-style picker reused for each segment
// ----------------------------------------------------------------------------

interface MultiPickerProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: PickerOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
  emptyText?: string;
  searchPlaceholder?: string;
  testId?: string;
  /** When true, options render with avatar (used for employees). */
  withAvatar?: boolean;
}

function MultiPicker({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
  isLoading,
  disabled,
  emptyText = 'Nenhum item disponivel.',
  searchPlaceholder = 'Buscar...',
  testId,
  withAvatar,
}: MultiPickerProps) {
  const [open, setOpen] = useState(false);

  const optionById = useMemo(() => {
    const map = new Map<string, PickerOption>();
    options.forEach(option => map.set(option.id, option));
    return map;
  }, [options]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const remove = (id: string) => {
    onChange(selected.filter(item => item !== id));
  };

  return (
    <div className="space-y-2" data-testid={testId}>
      <div className="flex items-center justify-between gap-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-violet-500" />
          {label}
        </Label>
        {selected.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {selected.length} selecionado(s)
          </span>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal h-10',
              selected.length === 0 && 'text-muted-foreground'
            )}
          >
            <span className="truncate">
              {selected.length === 0
                ? `Selecionar ${label.toLowerCase()}`
                : `${selected.length} ${label.toLowerCase()} selecionado(s)`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Carregando...' : emptyText}
              </CommandEmpty>
              <CommandGroup>
                {options.map(option => {
                  const isSelected = selected.includes(option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      value={`${option.label} ${option.caption ?? ''}`}
                      onSelect={() => toggle(option.id)}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                      {withAvatar && (
                        <Avatar className="size-6">
                          {option.photoUrl ? (
                            <AvatarImage
                              src={option.photoUrl}
                              alt={option.label}
                            />
                          ) : null}
                          <AvatarFallback className="text-[0.625rem] bg-violet-100 text-violet-700">
                            {getInitials(option.label)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate text-sm">
                          {option.label}
                        </span>
                        {option.caption && (
                          <span className="truncate text-[0.6875rem] text-muted-foreground">
                            {option.caption}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map(id => {
            const option = optionById.get(id);
            if (!option) return null;
            return (
              <Badge
                key={id}
                variant="outline"
                className="gap-1 pr-1 border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/8 dark:text-violet-300"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="rounded-full p-0.5 hover:bg-violet-200/60 dark:hover:bg-violet-500/20"
                  aria-label={`Remover ${option.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// AudienceSelector
// ----------------------------------------------------------------------------

export function AudienceSelector({
  value,
  onChange,
  broadcastToAll,
  onBroadcastToAllChange,
  className,
  tenantEmployeesCount,
  testId = 'audience-selector',
}: AudienceSelectorProps) {
  // Defensive defaults so callers can pass partial selections.
  const safeValue: AudienceSelection = {
    departments: value.departments ?? [],
    teams: value.teams ?? [],
    roles: value.roles ?? [],
    employees: value.employees ?? [],
  };

  // --------------------------------------------------------------------------
  // Data fetching
  // --------------------------------------------------------------------------

  const departmentsQuery = useQuery({
    queryKey: ['hr-audience-departments'],
    queryFn: async () => {
      const response = await departmentsService.listDepartments({
        perPage: 200,
        isActive: true,
      });
      return response.departments;
    },
    staleTime: 60_000,
  });

  const teamsQuery = useQuery({
    queryKey: ['hr-audience-teams'],
    queryFn: async () => {
      const response = await teamsService.listTeams({
        limit: 200,
        isActive: true,
      });
      return response.data;
    },
    staleTime: 60_000,
  });

  const positionsQuery = useQuery({
    queryKey: ['hr-audience-positions'],
    queryFn: async () => {
      const response = await positionsService.listPositions({
        perPage: 200,
        isActive: true,
      });
      return response.positions;
    },
    staleTime: 60_000,
  });

  const employeesQuery = useQuery({
    queryKey: ['hr-audience-employees'],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        perPage: 500,
        status: 'ACTIVE',
      });
      return response.employees;
    },
    staleTime: 60_000,
  });

  // --------------------------------------------------------------------------
  // Picker options
  // --------------------------------------------------------------------------

  const departmentOptions: PickerOption[] = useMemo(
    () =>
      (departmentsQuery.data ?? []).map(department => ({
        id: department.id,
        label: department.name,
        caption: department.code,
      })),
    [departmentsQuery.data]
  );

  const teamOptions: PickerOption[] = useMemo(
    () =>
      (teamsQuery.data ?? []).map(team => ({
        id: team.id,
        label: team.name,
        caption: team.description ?? undefined,
      })),
    [teamsQuery.data]
  );

  const positionOptions: PickerOption[] = useMemo(
    () =>
      (positionsQuery.data ?? []).map(position => ({
        id: position.id,
        label: position.name,
        caption: position.department?.name ?? position.code,
      })),
    [positionsQuery.data]
  );

  const employeeOptions: PickerOption[] = useMemo(
    () =>
      (employeesQuery.data ?? []).map(employee => ({
        id: employee.id,
        label: employee.fullName,
        caption:
          employee.position?.name ??
          employee.department?.name ??
          employee.registrationNumber,
        photoUrl: employee.photoUrl ?? null,
      })),
    [employeesQuery.data]
  );

  // --------------------------------------------------------------------------
  // Audience preview (client-side approximation)
  // --------------------------------------------------------------------------

  const audiencePreviewCount = useMemo(() => {
    if (broadcastToAll) {
      return tenantEmployeesCount ?? employeeOptions.length;
    }

    const selectedEmployeeIds = new Set<string>(safeValue.employees);

    // Add employees that match selected departments or positions
    const departmentSet = new Set(safeValue.departments);
    const positionSet = new Set(safeValue.roles);

    for (const employee of employeesQuery.data ?? []) {
      if (
        (employee.departmentId && departmentSet.has(employee.departmentId)) ||
        (employee.positionId && positionSet.has(employee.positionId))
      ) {
        selectedEmployeeIds.add(employee.id);
      }
    }

    // Teams add an unknown number of users — we count the number of teams
    // separately as a hint instead of pretending to know the union.
    return selectedEmployeeIds.size;
  }, [
    broadcastToAll,
    tenantEmployeesCount,
    employeeOptions.length,
    employeesQuery.data,
    safeValue.departments,
    safeValue.roles,
    safeValue.employees,
  ]);

  // Reset all picker selections when broadcast mode is enabled.
  useEffect(() => {
    if (broadcastToAll) {
      const hasAny =
        safeValue.departments.length > 0 ||
        safeValue.teams.length > 0 ||
        safeValue.roles.length > 0 ||
        safeValue.employees.length > 0;
      if (hasAny) {
        onChange(EMPTY_SELECTION);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastToAll]);

  const teamsHint =
    safeValue.teams.length > 0
      ? ` + membros de ${safeValue.teams.length} equipe(s)`
      : '';

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div data-testid={testId} className={cn('space-y-5', className)}>
      {/* Broadcast toggle */}
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-violet-600 text-white">
            <Globe2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">
              Enviar para todos os colaboradores
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quando ativado, o comunicado fica visivel para toda a empresa.
            </p>
          </div>
        </div>
        <Switch
          checked={broadcastToAll}
          onCheckedChange={onBroadcastToAllChange}
          aria-label="Enviar para todos os colaboradores"
          data-testid="audience-selector-broadcast-toggle"
        />
      </div>

      {/* Pickers — disabled when broadcast is on */}
      <div
        className={cn(
          'grid gap-4 sm:grid-cols-2',
          broadcastToAll && 'opacity-50 pointer-events-none'
        )}
      >
        <MultiPicker
          label="Departamentos"
          icon={Building2}
          options={departmentOptions}
          selected={safeValue.departments}
          onChange={departments =>
            onChange({ ...safeValue, departments })
          }
          isLoading={departmentsQuery.isLoading}
          disabled={broadcastToAll}
          emptyText="Nenhum departamento ativo."
          searchPlaceholder="Buscar departamento..."
          testId="audience-selector-departments"
        />

        <MultiPicker
          label="Equipes"
          icon={Users}
          options={teamOptions}
          selected={safeValue.teams}
          onChange={teams => onChange({ ...safeValue, teams })}
          isLoading={teamsQuery.isLoading}
          disabled={broadcastToAll}
          emptyText="Nenhuma equipe ativa."
          searchPlaceholder="Buscar equipe..."
          testId="audience-selector-teams"
        />

        <MultiPicker
          label="Cargos"
          icon={Briefcase}
          options={positionOptions}
          selected={safeValue.roles}
          onChange={roles => onChange({ ...safeValue, roles })}
          isLoading={positionsQuery.isLoading}
          disabled={broadcastToAll}
          emptyText="Nenhum cargo ativo."
          searchPlaceholder="Buscar cargo..."
          testId="audience-selector-roles"
        />

        <MultiPicker
          label="Colaboradores"
          icon={UserRound}
          options={employeeOptions}
          selected={safeValue.employees}
          onChange={employees => onChange({ ...safeValue, employees })}
          isLoading={employeesQuery.isLoading}
          disabled={broadcastToAll}
          emptyText="Nenhum colaborador encontrado."
          searchPlaceholder="Buscar colaborador..."
          testId="audience-selector-employees"
          withAvatar
        />
      </div>

      {/* Preview */}
      <div
        className="flex items-center justify-between gap-3 rounded-lg border border-violet-200 bg-violet-50/60 px-4 py-3 dark:border-violet-500/30 dark:bg-violet-500/8"
        data-testid="audience-selector-preview"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Users className="h-4 w-4 text-violet-600 dark:text-violet-300 shrink-0" />
          <p className="text-sm text-violet-700 dark:text-violet-200">
            {broadcastToAll
              ? `Toda a empresa (${audiencePreviewCount} colaboradores ativos) recebera este comunicado.`
              : `${audiencePreviewCount} colaborador(es)${teamsHint} receberao este comunicado.`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AudienceSelector;
