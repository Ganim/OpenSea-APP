'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { employeesService } from '@/services/hr';
import type { AssignPPEData, PPEItem } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, UserCheck, Package } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAssignPPE } from '../api';

interface AssignPPEModalProps {
  isOpen: boolean;
  onClose: () => void;
  ppeItem: PPEItem;
}

export function AssignPPEModal({
  isOpen,
  onClose,
  ppeItem,
}: AssignPPEModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [employeeId, setEmployeeId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState('NEW');
  const [notes, setNotes] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', 'list-for-assign', employeeSearch],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        search: employeeSearch || undefined,
        page: 1,
        perPage: 50,
      });
      return response.employees;
    },
    enabled: isOpen,
    staleTime: 30_000,
  });

  const employees = useMemo(() => employeesData ?? [], [employeesData]);

  const assignMutation = useAssignPPE({
    onSuccess: () => {
      resetForm();
      onClose();
    },
  });

  function resetForm() {
    setCurrentStep(1);
    setEmployeeId('');
    setQuantity('1');
    setCondition('NEW');
    setNotes('');
    setEmployeeSearch('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const selectedEmployee = employees.find((emp) => emp.id === employeeId);

  const steps: WizardStep[] = [
    {
      title: 'Colaborador',
      description: 'Selecione o colaborador',
      icon: <UserCheck className="h-10 w-10 text-sky-500" />,
      isValid: employeeId !== '',
      content: (
        <div className="space-y-4">
          <div>
            <Label>Buscar Colaborador</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="Buscar por nome..."
                className="pl-10"
              />
            </div>
          </div>

          {isLoadingEmployees ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setEmployeeId(emp.id)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                    employeeId === emp.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/8'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <p className="text-sm font-medium">{emp.fullName}</p>
                  {emp.position?.name && (
                    <p className="text-xs text-muted-foreground">
                      {emp.position.name}
                    </p>
                  )}
                </button>
              ))}
              {employees.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum colaborador encontrado
                </p>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Detalhes',
      description: 'Quantidade e condição',
      icon: <Package className="h-10 w-10 text-sky-500" />,
      isValid: Number(quantity) >= 1 && Number(quantity) <= ppeItem.currentStock,
      content: (
        <div className="space-y-4">
          {selectedEmployee && (
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">{selectedEmployee.fullName}</p>
              <p className="text-xs text-muted-foreground">
                EPI: {ppeItem.name} — Estoque: {ppeItem.currentStock}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assign-quantity">Quantidade *</Label>
              <Input
                id="assign-quantity"
                type="number"
                min="1"
                max={ppeItem.currentStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Disponível: {ppeItem.currentStock}
              </p>
            </div>
            <div>
              <Label htmlFor="assign-condition">Condição</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger id="assign-condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Novo</SelectItem>
                  <SelectItem value="GOOD">Bom</SelectItem>
                  <SelectItem value="WORN">Desgastado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assign-notes">Observações</Label>
            <Textarea
              id="assign-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre a entrega..."
              rows={3}
            />
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={async () => {
              const payload: AssignPPEData = {
                ppeItemId: ppeItem.id,
                employeeId,
                quantity: Number(quantity),
                condition: condition as AssignPPEData['condition'],
                ...(notes.trim() && { notes: notes.trim() }),
              };
              await assignMutation.mutateAsync(payload);
            }}
            disabled={
              assignMutation.isPending ||
              Number(quantity) < 1 ||
              Number(quantity) > ppeItem.currentStock
            }
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {assignMutation.isPending ? 'Atribuindo...' : 'Confirmar Entrega'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
