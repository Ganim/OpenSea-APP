'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { translateError } from '@/lib/error-messages';
import { employeesService } from '@/services/hr/employees.service';
import type { AssignEmployeeToShiftData } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, UserPlus, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface AssignEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignEmployeeToShiftData) => Promise<void>;
  shiftName: string;
  excludeEmployeeIds?: string[];
}

export function AssignEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  shiftName,
  excludeEmployeeIds = [],
}: AssignEmployeeModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', 'for-shift-assignment'],
    queryFn: async () => {
      const response = await employeesService.listEmployees({ perPage: 200 });
      return response.employees;
    },
    enabled: isOpen,
  });

  const filteredEmployees = useMemo(() => {
    const employees = employeesData ?? [];
    const excludeSet = new Set(excludeEmployeeIds);
    const available = employees.filter((e) => !excludeSet.has(e.id));

    if (!employeeSearch.trim()) return available;

    const q = employeeSearch.toLowerCase();
    return available.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        (e.position?.name && e.position.name.toLowerCase().includes(q)) ||
        (e.department?.name && e.department.name.toLowerCase().includes(q))
    );
  }, [employeesData, excludeEmployeeIds, employeeSearch]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSelectedEmployeeId('');
      setSelectedEmployeeName('');
      setStartDate('');
      setEndDate('');
      setNotes('');
      setIsSubmitting(false);
      setEmployeeSearch('');
    }
  }, [isOpen]);

  async function handleSubmit() {
    if (!selectedEmployeeId || !startDate) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        employeeId: selectedEmployeeId,
        startDate,
        endDate: endDate || undefined,
        notes: notes || undefined,
      });

      toast.success('Funcionário atribuído ao turno com sucesso');
      onClose();
    } catch (error) {
      toast.error(translateError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const steps = useMemo<WizardStep[]>(
    () => [
      {
        title: 'Selecionar Funcionário',
        description: `Atribuir funcionário ao turno "${shiftName}"`,
        icon: <Users className="h-16 w-16 text-sky-400 opacity-50" />,
        isValid: !!selectedEmployeeId,
        content: (
          <div className="space-y-3 py-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar funcionário..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Employee List */}
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-1">
              {isLoadingEmployees ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum funcionário disponível
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmployeeId(employee.id);
                      setSelectedEmployeeName(employee.fullName);
                    }}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      selectedEmployeeId === employee.id
                        ? 'bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium dark:bg-slate-700">
                      {employee.fullName
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{employee.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[employee.position?.name, employee.department?.name]
                          .filter(Boolean)
                          .join(' · ') || 'Sem cargo/departamento'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {selectedEmployeeName && (
              <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-500/10">
                <p className="text-sm">
                  <span className="text-muted-foreground">Selecionado: </span>
                  <span className="font-medium">{selectedEmployeeName}</span>
                </p>
              </div>
            )}
          </div>
        ),
      },
      {
        title: 'Período da Atribuição',
        description: 'Data de início e término (opcional)',
        icon: <UserPlus className="h-16 w-16 text-indigo-400 opacity-50" />,
        isValid: !!startDate,
        footer: (
          <Button
            onClick={handleSubmit}
            disabled={!selectedEmployeeId || !startDate || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atribuindo...
              </>
            ) : (
              'Atribuir ao Turno'
            )}
          </Button>
        ),
        content: (
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm">
                <span className="text-muted-foreground">Funcionário: </span>
                <span className="font-medium">{selectedEmployeeName}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Turno: </span>
                <span className="font-medium">{shiftName}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                Data de Início <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                Data de Término{' '}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Observações</Label>
              <Input
                placeholder="Observações sobre a atribuição..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>
        ),
      },
    ],
    [
      selectedEmployeeId,
      selectedEmployeeName,
      startDate,
      endDate,
      notes,
      shiftName,
      isSubmitting,
      employeeSearch,
      filteredEmployees,
      isLoadingEmployees,
    ]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={onClose}
    />
  );
}
