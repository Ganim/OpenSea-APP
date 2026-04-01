'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Textarea } from '@/components/ui/textarea';
import type { DelegationScope } from '@/types/hr';
import type { Employee } from '@/types/hr';
import {
  Calendar,
  Loader2,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

// ============================================================================
// Scope Labels
// ============================================================================

const SCOPE_OPTIONS: { value: DelegationScope; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'ABSENCES', label: 'Ausências' },
  { value: 'VACATIONS', label: 'Férias' },
  { value: 'OVERTIME', label: 'Horas Extras' },
  { value: 'REQUESTS', label: 'Solicitações' },
];

// ============================================================================
// Props
// ============================================================================

interface CreateDelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    delegateId: string;
    scope: DelegationScope;
    startDate: string;
    endDate?: string;
    reason?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  employees: Employee[];
  isLoadingEmployees: boolean;
}

export function CreateDelegationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  employees,
  isLoadingEmployees,
}: CreateDelegationModalProps) {
  // ============================================================================
  // State
  // ============================================================================

  const [currentStep, setCurrentStep] = useState(1);
  const [delegateId, setDelegateId] = useState('');
  const [scope, setScope] = useState<DelegationScope>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // ============================================================================
  // Reset
  // ============================================================================

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setDelegateId('');
    setScope('ALL');
    setStartDate('');
    setEndDate('');
    setReason('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // ============================================================================
  // Submit
  // ============================================================================

  const handleSubmit = useCallback(async () => {
    await onSubmit({
      delegateId,
      scope,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      reason: reason.trim() || undefined,
    });
    handleClose();
  }, [delegateId, scope, startDate, endDate, reason, onSubmit, handleClose]);

  // ============================================================================
  // Validation
  // ============================================================================

  const isStep1Valid = useMemo(() => {
    return delegateId !== '' && scope !== undefined;
  }, [delegateId, scope]);

  const isStep2Valid = useMemo(() => {
    if (!startDate) return false;
    if (endDate && new Date(endDate) <= new Date(startDate)) return false;
    return true;
  }, [startDate, endDate]);

  // ============================================================================
  // Selected Employee Name
  // ============================================================================

  const selectedEmployee = useMemo(
    () => employees.find((emp) => emp.id === delegateId),
    [employees, delegateId],
  );

  // ============================================================================
  // Steps
  // ============================================================================

  const steps: WizardStep[] = useMemo(
    () => [
      // Step 1: Select delegate and scope
      {
        title: 'Delegado e Escopo',
        description:
          'Selecione o colaborador e o escopo da delegação de aprovação',
        icon: (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-500/15">
              <UserCheck className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs text-muted-foreground">Passo 1 de 2</span>
          </div>
        ),
        isValid: isStep1Valid,
        content: (
          <div className="space-y-5 p-1">
            <div className="space-y-2">
              <Label htmlFor="delegate">Colaborador Delegado</Label>
              {isLoadingEmployees ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando colaboradores...
                </div>
              ) : (
                <Select value={delegateId} onValueChange={setDelegateId}>
                  <SelectTrigger id="delegate">
                    <SelectValue placeholder="Selecione um colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.fullName}
                        {emp.position?.name
                          ? ` - ${emp.position.name}`
                          : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                Este colaborador poderá aprovar em seu nome
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Escopo da Delegação</Label>
              <Select
                value={scope}
                onValueChange={(val) => setScope(val as DelegationScope)}
              >
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Defina quais tipos de aprovação serão delegados
              </p>
            </div>
          </div>
        ),
      },

      // Step 2: Dates and reason
      {
        title: 'Período e Motivo',
        description: 'Defina o período de vigência e o motivo da delegação',
        icon: (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-500/15">
              <Calendar className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            </div>
            <span className="text-xs text-muted-foreground">Passo 2 de 2</span>
          </div>
        ),
        isValid: isStep2Valid,
        onBack: () => setCurrentStep(1),
        content: (
          <div className="space-y-5 p-1">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                Data de Término{' '}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
              <p className="text-xs text-muted-foreground">
                Se não informada, a delegação permanece ativa até ser revogada
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Motivo{' '}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Férias, viagem, licença..."
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Summary */}
            {selectedEmployee && startDate && (
              <div className="rounded-lg border border-border bg-slate-50 dark:bg-white/5 p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Resumo da Delegação
                </p>
                <p className="text-sm">
                  <span className="font-medium">Delegado:</span>{' '}
                  {selectedEmployee.fullName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Escopo:</span>{' '}
                  {SCOPE_OPTIONS.find((o) => o.value === scope)?.label}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Início:</span>{' '}
                  {new Date(startDate).toLocaleDateString('pt-BR')}
                  {endDate && (
                    <>
                      {' '}
                      até {new Date(endDate).toLocaleDateString('pt-BR')}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        ),
        footer: (
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isStep2Valid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Delegação'
              )}
            </Button>
          </div>
        ),
      },
    ],
    [
      delegateId,
      scope,
      startDate,
      endDate,
      reason,
      isStep1Valid,
      isStep2Valid,
      isSubmitting,
      employees,
      isLoadingEmployees,
      selectedEmployee,
      handleSubmit,
    ],
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
      heightClass="h-[520px]"
    />
  );
}
