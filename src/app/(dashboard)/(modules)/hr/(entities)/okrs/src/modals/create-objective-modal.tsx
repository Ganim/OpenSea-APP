/**
 * Create Objective Modal
 * StepWizard para criar novo objetivo OKR
 */

'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { employeesService } from '@/services/hr';
import type {
  ObjectiveLevel,
  KeyResultType,
  CreateKeyResultData,
} from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Loader2, Plus, Search, Target, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCreateObjective, useCreateKeyResult } from '../api';
import { getObjectiveLevelColor } from '../utils';
import { cn } from '@/lib/utils';

interface CreateObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// LEVEL OPTIONS
// ============================================================================

const LEVEL_OPTIONS: {
  value: ObjectiveLevel;
  label: string;
  description: string;
}[] = [
  {
    value: 'COMPANY',
    label: 'Empresa',
    description: 'Objetivo estratégico da empresa',
  },
  {
    value: 'DEPARTMENT',
    label: 'Departamento',
    description: 'Objetivo do departamento',
  },
  { value: 'TEAM', label: 'Equipe', description: 'Objetivo da equipe' },
  { value: 'INDIVIDUAL', label: 'Individual', description: 'Objetivo pessoal' },
];

const KR_TYPE_OPTIONS: { value: KeyResultType; label: string }[] = [
  { value: 'NUMERIC', label: 'Numérico' },
  { value: 'PERCENTAGE', label: 'Percentual' },
  { value: 'CURRENCY', label: 'Monetário' },
  { value: 'BINARY', label: 'Binário (Sim/Não)' },
];

const PERIOD_OPTIONS = [
  { value: 'Q1_2026', label: '1T 2026' },
  { value: 'Q2_2026', label: '2T 2026' },
  { value: 'Q3_2026', label: '3T 2026' },
  { value: 'Q4_2026', label: '4T 2026' },
  { value: 'Q1_2027', label: '1T 2027' },
  { value: 'Q2_2027', label: '2T 2027' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateObjectiveModal({
  isOpen,
  onClose,
}: CreateObjectiveModalProps) {
  const createObjective = useCreateObjective();
  const createKeyResult = useCreateKeyResult();

  // Step 1 state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<ObjectiveLevel>('COMPANY');
  const [period, setPeriod] = useState('Q2_2026');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');

  // Step 2 state
  const [keyResults, setKeyResults] = useState<
    (CreateKeyResultData & { tempId: string })[]
  >([]);
  const [krTitle, setKrTitle] = useState('');
  const [krType, setKrType] = useState<KeyResultType>('NUMERIC');
  const [krTarget, setKrTarget] = useState('');
  const [krUnit, setKrUnit] = useState('');
  const [krWeight, setKrWeight] = useState('1');

  const [currentStep, setCurrentStep] = useState(1);

  // Employee search
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'okr-owner-options'],
    queryFn: () =>
      employeesService.listEmployees({ perPage: 100, status: 'ACTIVE' }),
    staleTime: 60_000,
  });

  const filteredEmployees = useMemo(() => {
    const employees = employeesData?.employees ?? [];
    if (!ownerSearch.trim()) return employees.slice(0, 10);
    const q = ownerSearch.toLowerCase();
    return employees
      .filter(e => e.fullName.toLowerCase().includes(q))
      .slice(0, 10);
  }, [employeesData, ownerSearch]);

  const selectedOwnerName = useMemo(() => {
    if (!ownerId) return '';
    const emp = employeesData?.employees?.find(e => e.id === ownerId);
    return emp?.fullName ?? '';
  }, [ownerId, employeesData]);

  // ============================================================================
  // ADD KEY RESULT
  // ============================================================================

  const handleAddKr = useCallback(() => {
    if (!krTitle.trim() || !krTarget) {
      toast.error('Preencha o título e a meta do resultado-chave');
      return;
    }
    setKeyResults(prev => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        title: krTitle.trim(),
        type: krType,
        targetValue: parseFloat(krTarget),
        unit: krUnit.trim() || undefined,
        weight: parseFloat(krWeight) || 1,
      },
    ]);
    setKrTitle('');
    setKrTarget('');
    setKrUnit('');
    setKrWeight('1');
  }, [krTitle, krType, krTarget, krUnit, krWeight]);

  const handleRemoveKr = useCallback((tempId: string) => {
    setKeyResults(prev => prev.filter(kr => kr.tempId !== tempId));
  }, []);

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Preencha o título do objetivo');
      return;
    }
    if (!ownerId) {
      toast.error('Selecione o responsável');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Preencha as datas de início e fim');
      return;
    }

    try {
      const result = await createObjective.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        ownerId,
        level,
        period,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });

      // Create key results sequentially
      const objectiveId = result.objective.id;
      for (const kr of keyResults) {
        await createKeyResult.mutateAsync({
          objectiveId,
          data: {
            title: kr.title,
            type: kr.type,
            targetValue: kr.targetValue,
            unit: kr.unit,
            weight: kr.weight,
          },
        });
      }

      handleReset();
      onClose();
    } catch {
      // Error toast already handled by mutation
    }
  }, [
    title,
    description,
    ownerId,
    level,
    period,
    startDate,
    endDate,
    keyResults,
    createObjective,
    createKeyResult,
    onClose,
  ]);

  const handleReset = useCallback(() => {
    setTitle('');
    setDescription('');
    setLevel('COMPANY');
    setPeriod('Q2_2026');
    setStartDate('');
    setEndDate('');
    setOwnerId('');
    setOwnerSearch('');
    setKeyResults([]);
    setKrTitle('');
    setKrTarget('');
    setKrUnit('');
    setKrWeight('1');
    setCurrentStep(1);
  }, []);

  // ============================================================================
  // STEP VALIDATION
  // ============================================================================

  const isStep1Valid =
    title.trim().length > 0 && ownerId && startDate && endDate;

  // ============================================================================
  // STEPS
  // ============================================================================

  const steps: WizardStep[] = [
    {
      title: 'Informações do Objetivo',
      description: 'Defina o objetivo estratégico',
      icon: <Target className="h-10 w-10 text-violet-500" />,
      content: (
        <div className="space-y-4 px-1">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="obj-title">
              Título <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="obj-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Aumentar receita recorrente"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="obj-desc">Descrição</Label>
            <Textarea
              id="obj-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição detalhada do objetivo"
              rows={2}
            />
          </div>

          {/* Level */}
          <div className="space-y-2">
            <Label>Nível</Label>
            <div className="grid grid-cols-2 gap-2">
              {LEVEL_OPTIONS.map(option => {
                const color = getObjectiveLevelColor(option.value);
                const isSelected = level === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLevel(option.value)}
                    className={cn(
                      'rounded-lg border p-2 text-left text-xs transition-colors',
                      isSelected
                        ? color === 'violet'
                          ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/8 dark:text-violet-300'
                          : color === 'sky'
                            ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300'
                            : color === 'teal'
                              ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/8 dark:text-teal-300'
                              : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300'
                        : 'border-border hover:bg-accent'
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-muted-foreground mt-0.5">
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period + Owner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="obj-period">Período</Label>
              <select
                id="obj-period"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                {PERIOD_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>
                Responsável <span className="text-rose-500">*</span>
              </Label>
              {selectedOwnerName ? (
                <div className="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
                  <span className="truncate">{selectedOwnerName}</span>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground ml-2"
                    onClick={() => {
                      setOwnerId('');
                      setOwnerSearch('');
                    }}
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={ownerSearch}
                      onChange={e => setOwnerSearch(e.target.value)}
                      placeholder="Buscar funcionário..."
                      className="pl-8 h-9"
                    />
                  </div>
                  {filteredEmployees.length > 0 && (
                    <div className="max-h-28 overflow-y-auto rounded-md border bg-popover text-xs">
                      {filteredEmployees.map(emp => (
                        <button
                          key={emp.id}
                          type="button"
                          className="w-full px-3 py-1.5 text-left hover:bg-accent transition-colors"
                          onClick={() => {
                            setOwnerId(emp.id);
                            setOwnerSearch('');
                          }}
                        >
                          {emp.fullName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="obj-start">
                Data de Início <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                id="obj-start"
                value={startDate}
                onChange={v => setStartDate(typeof v === 'string' ? v : '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obj-end">
                Data de Término <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                id="obj-end"
                value={endDate}
                onChange={v => setEndDate(typeof v === 'string' ? v : '')}
              />
            </div>
          </div>
        </div>
      ),
      isValid: !!isStep1Valid,
    },
    {
      title: 'Resultados-Chave',
      description: 'Adicione resultados mensuráveis',
      icon: <BarChart3 className="h-10 w-10 text-emerald-500" />,
      content: (
        <div className="space-y-4 px-1">
          {/* Added KRs */}
          {keyResults.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {keyResults.length} resultado(s)-chave adicionado(s)
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {keyResults.map(kr => (
                  <div
                    key={kr.tempId}
                    className="flex items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{kr.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Meta: {kr.targetValue}
                        {kr.unit ? ` ${kr.unit}` : ''} | Peso: {kr.weight}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/8"
                      onClick={() => handleRemoveKr(kr.tempId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add KR form */}
          <div className="rounded-lg border border-dashed p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Adicionar Resultado-Chave
            </p>

            <div className="space-y-2">
              <Label htmlFor="kr-title">Título</Label>
              <Input
                id="kr-title"
                value={krTitle}
                onChange={e => setKrTitle(e.target.value)}
                placeholder="Ex: Atingir R$ 500k em MRR"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="kr-type">Tipo</Label>
                <select
                  id="kr-type"
                  value={krType}
                  onChange={e => setKrType(e.target.value as KeyResultType)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  {KR_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kr-target">Meta</Label>
                <Input
                  id="kr-target"
                  type="number"
                  value={krTarget}
                  onChange={e => setKrTarget(e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="kr-unit">Unidade</Label>
                <Input
                  id="kr-unit"
                  value={krUnit}
                  onChange={e => setKrUnit(e.target.value)}
                  placeholder="Ex: %, R$, un"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kr-weight">Peso</Label>
                <Input
                  id="kr-weight"
                  type="number"
                  value={krWeight}
                  onChange={e => setKrWeight(e.target.value)}
                  placeholder="1"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2.5 w-full"
              onClick={handleAddKr}
              disabled={!krTitle.trim() || !krTarget}
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar Resultado-Chave
            </Button>
          </div>
        </div>
      ),
      isValid: true,
      footer: (
        <div className="flex items-center gap-2 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(1)}
          >
            &larr; Voltar
          </Button>
          <Button
            type="button"
            disabled={createObjective.isPending || createKeyResult.isPending}
            onClick={handleSubmit}
          >
            {(createObjective.isPending || createKeyResult.isPending) && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Criar Objetivo
          </Button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          handleReset();
          onClose();
        }
      }}
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
