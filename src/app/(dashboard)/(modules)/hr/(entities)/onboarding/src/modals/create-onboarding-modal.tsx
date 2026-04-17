'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { useCreateOnboarding } from '../api/mutations';
import { employeesService } from '@/services/hr';
import type { Employee } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  ClipboardCheck,
  ListTodo,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface CreateOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

interface ChecklistItemDraft {
  title: string;
  description: string;
}

export function CreateOnboardingModal({
  open,
  onOpenChange,
  onClose,
}: CreateOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 — Template
  const [title, setTitle] = useState('');
  const [draftItems, setDraftItems] = useState<ChecklistItemDraft[]>([
    { title: '', description: '' },
  ]);

  // Step 2 — Employee selection
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', 'onboarding-picker'],
    queryFn: async () => {
      const res = await employeesService.listEmployees({ perPage: 200 });
      return res.employees ?? [];
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const employees = employeesData ?? [];

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employees;
    const q = employeeSearch.toLowerCase();
    return employees.filter(
      (e: Employee) =>
        e.fullName.toLowerCase().includes(q) ||
        e.registrationNumber?.toLowerCase().includes(q)
    );
  }, [employees, employeeSearch]);

  const selectedEmployee = employees.find(
    (e: Employee) => e.id === selectedEmployeeId
  );

  const createOnboarding = useCreateOnboarding({
    onSuccess: () => {
      handleReset();
      onClose();
    },
  });

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setTitle('');
    setDraftItems([{ title: '', description: '' }]);
    setEmployeeSearch('');
    setSelectedEmployeeId('');
  }, []);

  const handleAddItem = useCallback(() => {
    setDraftItems(prev => [...prev, { title: '', description: '' }]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setDraftItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleItemChange = useCallback(
    (index: number, field: 'title' | 'description', value: string) => {
      setDraftItems(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const validItems = draftItems.filter(item => item.title.trim() !== '');
    createOnboarding.mutate({
      employeeId: selectedEmployeeId,
      title: title.trim() || 'Onboarding',
      items:
        validItems.length > 0
          ? validItems.map(item => ({
              title: item.title.trim(),
              description: item.description.trim() || undefined,
            }))
          : undefined,
    });
  }, [selectedEmployeeId, title, draftItems, createOnboarding]);

  const hasValidItems = draftItems.some(item => item.title.trim() !== '');
  const step1Valid = title.trim().length > 0 && hasValidItems;
  const step2Valid = selectedEmployeeId.length > 0;

  const steps: WizardStep[] = [
    {
      title: 'Modelo do Checklist',
      description: 'Defina o título e os itens do checklist de onboarding',
      icon: <ListTodo className="h-16 w-16 text-emerald-500/60" />,
      isValid: step1Valid,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="onb-title" className="text-xs">
              Título do Checklist <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="onb-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Onboarding Engenharia, Integração Comercial..."
              className="h-9"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">
              Itens do Checklist <span className="text-rose-500">*</span>
            </Label>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2">
                {draftItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start border border-border rounded-lg p-2.5 bg-white dark:bg-slate-800/60"
                  >
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-emerald-50 dark:bg-emerald-500/10 shrink-0 mt-1">
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.title}
                        onChange={e =>
                          handleItemChange(index, 'title', e.target.value)
                        }
                        placeholder="Título da tarefa"
                        className="h-8 text-sm"
                      />
                      <Input
                        value={item.description}
                        onChange={e =>
                          handleItemChange(index, 'description', e.target.value)
                        }
                        placeholder="Descrição (opcional)"
                        className="h-8 text-sm text-muted-foreground"
                      />
                    </div>
                    {draftItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0 mt-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="w-full mt-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Item
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Atribuir Funcionário',
      description: 'Selecione o colaborador que receberá este checklist',
      icon: <Users className="h-16 w-16 text-blue-500/60" />,
      isValid: step2Valid,
      onBack: () => setCurrentStep(1),
      content: (
        <div className="space-y-3">
          {selectedEmployee && (
            <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 shrink-0">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedEmployee.fullName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedEmployee.registrationNumber}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedEmployeeId('')}
              >
                Alterar
              </Button>
            </div>
          )}

          {!selectedEmployee && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar funcionário por nome ou matrícula..."
                  value={employeeSearch}
                  onChange={e => setEmployeeSearch(e.target.value)}
                  className="pl-9 h-9"
                  autoFocus
                />
              </div>

              <ScrollArea className="max-h-[280px]">
                <div className="space-y-1">
                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      {employeeSearch
                        ? 'Nenhum funcionário encontrado'
                        : 'Nenhum funcionário cadastrado'}
                    </div>
                  ) : (
                    filteredEmployees.map((emp: Employee) => (
                      <div
                        key={emp.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => {
                          setSelectedEmployeeId(emp.id);
                        }}
                      >
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0">
                          <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {emp.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {emp.registrationNumber}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      ),
      footer: (
        <Button
          onClick={handleSubmit}
          disabled={!step2Valid || createOnboarding.isPending}
        >
          {createOnboarding.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ClipboardCheck className="h-4 w-4 mr-2" />
          )}
          Criar Checklist
        </Button>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={() => {
        handleReset();
        onClose();
      }}
    />
  );
}
