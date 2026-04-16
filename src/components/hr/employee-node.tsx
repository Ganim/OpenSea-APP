/**
 * Employee Node — Custom React Flow Node
 *
 * Card compacto (220x96) para representar um funcionário no organograma
 * interativo. Inclui avatar (foto ou iniciais com cor por hash), nome,
 * cargo, badge de departamento e indicador colorido de status (ativo,
 * férias, licença, onboarding, desligado).
 *
 * Hover exibe tooltip com detalhes adicionais. Clique navega para o
 * perfil do funcionário.
 */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ORG_NODE_HEIGHT,
  ORG_NODE_WIDTH,
  getEmployeeHueIndex,
  getEmployeeInitials,
  resolveEmployeeStatusKind,
  type OrgEmployeeStatusKind,
} from '@/lib/hr/build-org-tree';
import { cn } from '@/lib/utils';
import type { Employee } from '@/types/hr';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// ============================================================================
// STYLE TOKENS
// ============================================================================

interface StatusVisualToken {
  borderClass: string;
  ringClass: string;
  dotClass: string;
  label: string;
}

const STATUS_VISUAL_TOKENS: Record<OrgEmployeeStatusKind, StatusVisualToken> = {
  active: {
    borderClass: 'border-emerald-500/70 dark:border-emerald-400/60',
    ringClass: 'hover:ring-emerald-500/30',
    dotClass: 'bg-emerald-500',
    label: 'Ativo',
  },
  'on-leave': {
    borderClass: 'border-amber-500/70 dark:border-amber-400/60',
    ringClass: 'hover:ring-amber-500/30',
    dotClass: 'bg-amber-500',
    label: 'Afastado',
  },
  'on-vacation': {
    borderClass: 'border-sky-500/70 dark:border-sky-400/60',
    ringClass: 'hover:ring-sky-500/30',
    dotClass: 'bg-sky-500',
    label: 'Em férias',
  },
  onboarding: {
    borderClass: 'border-violet-500/70 dark:border-violet-400/60',
    ringClass: 'hover:ring-violet-500/30',
    dotClass: 'bg-violet-500',
    label: 'Onboarding',
  },
  terminated: {
    borderClass: 'border-rose-500/70 dark:border-rose-400/60 border-dashed',
    ringClass: 'hover:ring-rose-500/30',
    dotClass: 'bg-rose-500',
    label: 'Desligado',
  },
  unknown: {
    borderClass: 'border-border',
    ringClass: 'hover:ring-border',
    dotClass: 'bg-muted-foreground',
    label: 'Status indefinido',
  },
};

/**
 * Paleta de cores determinística para o avatar com iniciais. Mantém
 * consistência visual entre execuções (hash do nome → mesma cor).
 */
const AVATAR_HUE_PALETTE: string[] = [
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-violet-500 to-fuchsia-600',
  'bg-gradient-to-br from-sky-500 to-indigo-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-blue-500 to-cyan-600',
  'bg-gradient-to-br from-lime-500 to-emerald-600',
  'bg-gradient-to-br from-purple-500 to-violet-600',
];

// ============================================================================
// NODE DATA SHAPE
// ============================================================================

export interface EmployeeNodeData {
  employee: Employee;
  level: number;
  childCount: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmployeeNode({ data }: NodeProps) {
  const { employee, childCount } = data as unknown as EmployeeNodeData;
  const router = useRouter();

  const statusKind = resolveEmployeeStatusKind(employee);
  const statusVisualToken = STATUS_VISUAL_TOKENS[statusKind];
  const initials = getEmployeeInitials(employee.fullName);
  const avatarHueClass =
    AVATAR_HUE_PALETTE[
      getEmployeeHueIndex(employee.fullName, AVATAR_HUE_PALETTE.length)
    ];

  const positionName = employee.position?.name ?? null;
  const departmentName = employee.department?.name ?? null;
  const supervisorName = (employee as Employee & { supervisor?: Employee | null })
    .supervisor?.fullName;

  const handleNavigateToEmployee = useCallback(() => {
    router.push(`/hr/employees/${employee.id}`);
  }, [router, employee.id]);

  const handleKeyboardActivation = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNavigateToEmployee();
      }
    },
    [handleNavigateToEmployee]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            data-testid={`employee-node-${employee.id}`}
            role="button"
            tabIndex={0}
            onClick={handleNavigateToEmployee}
            onKeyDown={handleKeyboardActivation}
            className={cn(
              'relative cursor-pointer rounded-xl border-2 bg-white dark:bg-slate-800/90 shadow-sm',
              'transition-all hover:shadow-md hover:ring-4 outline-none',
              'focus-visible:ring-4 focus-visible:ring-violet-500/40',
              statusVisualToken.borderClass,
              statusVisualToken.ringClass
            )}
            style={{ width: ORG_NODE_WIDTH, height: ORG_NODE_HEIGHT }}
          >
            {/* React Flow handles (top = entrada do parent / bottom = saída para filhos) */}
            <Handle
              type="target"
              position={Position.Top}
              className="!h-2 !w-2 !border-0 !bg-slate-300 dark:!bg-slate-600"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              className="!h-2 !w-2 !border-0 !bg-slate-300 dark:!bg-slate-600"
            />

            <div className="flex h-full items-center gap-3 px-3">
              <Avatar className="h-12 w-12 shrink-0 ring-2 ring-white dark:ring-slate-800">
                {employee.photoUrl && (
                  <AvatarImage
                    src={employee.photoUrl}
                    alt={employee.fullName}
                  />
                )}
                <AvatarFallback
                  className={cn(
                    'text-sm font-semibold text-white',
                    avatarHueClass
                  )}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      statusVisualToken.dotClass
                    )}
                    aria-hidden="true"
                  />
                  <p className="truncate text-sm font-semibold text-foreground">
                    {employee.fullName}
                  </p>
                </div>

                {positionName && (
                  <p className="truncate text-xs text-muted-foreground">
                    {positionName}
                  </p>
                )}

                {departmentName && (
                  <span className="mt-0.5 inline-flex w-fit items-center rounded-full border border-border bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                    {departmentName}
                  </span>
                )}
              </div>
            </div>

            {childCount > 0 && (
              <span
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm dark:bg-slate-800"
                aria-label={`${childCount} subordinado${childCount === 1 ? '' : 's'}`}
              >
                {childCount}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-xs">
          <div className="flex flex-col gap-1 text-xs">
            <p className="font-semibold text-sm">{employee.fullName}</p>
            {positionName && (
              <p className="text-muted-foreground">Cargo: {positionName}</p>
            )}
            {departmentName && (
              <p className="text-muted-foreground">
                Departamento: {departmentName}
              </p>
            )}
            {supervisorName && (
              <p className="text-muted-foreground">
                Gestor direto: {supervisorName}
              </p>
            )}
            {childCount > 0 && (
              <p className="text-muted-foreground">
                Subordinados diretos: {childCount}
              </p>
            )}
            <p className="mt-1 inline-flex items-center gap-1.5">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  statusVisualToken.dotClass
                )}
                aria-hidden="true"
              />
              <span>{statusVisualToken.label}</span>
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
