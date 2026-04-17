'use client';

import { Button } from '@/components/ui/button';
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
import type { CreateBulkReviewsData, ReviewAssignment } from '@/types/hr';
import { employeesService } from '@/services/hr/employees.service';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, UserCheck, Users } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface CreateReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBulkReviewsData) => void;
  cycleId: string;
  cycleName: string;
  isLoading?: boolean;
}

export function CreateReviewsModal({
  open,
  onOpenChange,
  onSubmit,
  cycleId,
  cycleName,
  isLoading,
}: CreateReviewsModalProps) {
  const [step, setStep] = useState(1);
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedReviewerId, setSelectedReviewerId] = useState('');

  // Fetch employees for assignment
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'for-reviews'],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        perPage: 200,
        status: 'ACTIVE',
      });
      return response.employees;
    },
    enabled: open,
  });

  const employees = employeesData ?? [];

  const resetForm = useCallback(() => {
    setStep(1);
    setAssignments([]);
    setSearchQuery('');
    setSelectedEmployeeId('');
    setSelectedReviewerId('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange]);

  const handleSubmit = useCallback(() => {
    if (assignments.length === 0) return;
    onSubmit({
      reviewCycleId: cycleId,
      assignments,
    });
    resetForm();
  }, [assignments, cycleId, onSubmit, resetForm]);

  const handleAddAssignment = useCallback(() => {
    if (!selectedEmployeeId || !selectedReviewerId) return;
    if (selectedEmployeeId === selectedReviewerId) return;

    // Avoid duplicate employee
    if (assignments.some(a => a.employeeId === selectedEmployeeId)) return;

    setAssignments(prev => [
      ...prev,
      { employeeId: selectedEmployeeId, reviewerId: selectedReviewerId },
    ]);
    setSelectedEmployeeId('');
    setSelectedReviewerId('');
  }, [selectedEmployeeId, selectedReviewerId, assignments]);

  const handleRemoveAssignment = useCallback((index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getEmployeeName = useCallback(
    (id: string) => {
      const emp = employees.find(e => e.id === id);
      return emp ? emp.fullName : id.slice(0, 8) + '...';
    },
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(
      e =>
        e.fullName.toLowerCase().includes(q) ||
        e.registrationNumber?.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  const step1Valid = assignments.length > 0;

  const steps: WizardStep[] = [
    {
      title: 'Atribuir Avaliações',
      description: `Selecione os funcionários e avaliadores para o ciclo "${cycleName}"`,
      icon: (
        <Users className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          {/* Add assignment form */}
          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Adicionar atribuição
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Funcionário</Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map(emp => (
                      <SelectItem
                        key={emp.id}
                        value={emp.id}
                        disabled={assignments.some(
                          a => a.employeeId === emp.id
                        )}
                      >
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Avaliador</Label>
                <Select
                  value={selectedReviewerId}
                  onValueChange={setSelectedReviewerId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(e => e.id !== selectedEmployeeId)
                      .map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.fullName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleAddAssignment}
              disabled={
                !selectedEmployeeId ||
                !selectedReviewerId ||
                selectedEmployeeId === selectedReviewerId
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>

          {/* Assignments list */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {assignments.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">
                Nenhuma atribuição adicionada
              </p>
            ) : (
              assignments.map((assignment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs truncate">
                        {getEmployeeName(assignment.employeeId)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      &rarr;
                    </span>
                    <span className="text-xs truncate text-muted-foreground">
                      {getEmployeeName(assignment.reviewerId)}
                    </span>
                  </div>
                  <button
                    className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 shrink-0"
                    onClick={() => handleRemoveAssignment(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {assignments.length} atribuição(ões) adicionada(s)
          </p>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2 p-4 border-t border-border/50">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!step1Valid || isLoading}>
            {isLoading
              ? 'Criando...'
              : `Criar ${assignments.length} avaliação(ões)`}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      onClose={handleClose}
      heightClass="h-[520px]"
    />
  );
}
