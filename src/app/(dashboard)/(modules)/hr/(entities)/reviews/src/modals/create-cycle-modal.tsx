'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import type { ReviewCycleType, CreateReviewCycleData } from '@/types/hr';
import { CalendarDays, ClipboardCheck, Settings } from 'lucide-react';
import { useState } from 'react';
import { REVIEW_CYCLE_TYPE_LABELS } from '../constants';

interface CreateCycleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateReviewCycleData) => void;
  isLoading?: boolean;
}

export function CreateCycleModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateCycleModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ReviewCycleType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetForm = () => {
    setStep(1);
    setName('');
    setDescription('');
    setType('');
    setStartDate('');
    setEndDate('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!name || !type || !startDate || !endDate) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      type: type as ReviewCycleType,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    });
    resetForm();
  };

  const step1Valid = name.trim().length > 0 && type !== '';
  const step2Valid =
    startDate !== '' &&
    endDate !== '' &&
    new Date(endDate) > new Date(startDate);

  const steps: WizardStep[] = [
    {
      title: 'Informações do Ciclo',
      description: 'Defina o nome e tipo do ciclo de avaliação',
      icon: (
        <ClipboardCheck className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="cycle-name">Nome do ciclo *</Label>
            <Input
              id="cycle-name"
              placeholder="Ex: Avaliação Anual 2026"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle-type">Tipo *</Label>
            <Select
              value={type}
              onValueChange={val => setType(val as ReviewCycleType)}
            >
              <SelectTrigger id="cycle-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REVIEW_CYCLE_TYPE_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle-description">Descrição</Label>
            <Textarea
              id="cycle-description"
              placeholder="Descrição opcional do ciclo de avaliação"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Período',
      description: 'Defina as datas de início e fim do ciclo',
      icon: (
        <CalendarDays className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step2Valid,
      onBack: () => setStep(1),
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="cycle-start">Data de início *</Label>
            <DatePicker
              id="cycle-start"
              value={startDate}
              onChange={v => setStartDate(typeof v === 'string' ? v : '')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle-end">Data de fim *</Label>
            <DatePicker
              id="cycle-end"
              value={endDate}
              onChange={v => setEndDate(typeof v === 'string' ? v : '')}
              fromDate={startDate ? new Date(startDate) : undefined}
            />
          </div>

          {startDate && endDate && new Date(endDate) <= new Date(startDate) && (
            <p className="text-sm text-rose-500">
              A data de fim deve ser posterior à data de início
            </p>
          )}
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2 p-4 border-t border-border/50">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!step2Valid || isLoading}>
            {isLoading ? 'Criando...' : 'Criar ciclo'}
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
      heightClass="h-[460px]"
    />
  );
}
