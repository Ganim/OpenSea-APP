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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CreateTrainingProgramData } from '@/types/hr';
import { BookOpen, Loader2, Settings, User } from 'lucide-react';
import { useState } from 'react';
import {
  TRAINING_CATEGORY_OPTIONS,
  TRAINING_FORMAT_OPTIONS,
} from '../constants';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CreateTrainingProgramData) => Promise<void>;
}

export function CreateModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: CreateModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [format, setFormat] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [instructor, setInstructor] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [validityMonths, setValidityMonths] = useState('');

  const resetForm = () => {
    setStep(1);
    setName('');
    setDescription('');
    setCategory('');
    setFormat('');
    setDurationHours('');
    setInstructor('');
    setMaxParticipants('');
    setIsMandatory(false);
    setValidityMonths('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const step1Valid =
    name.trim().length > 0 &&
    category.length > 0 &&
    format.length > 0;

  const step2Valid = Number(durationHours) > 0;

  const handleSubmit = async () => {
    const data: CreateTrainingProgramData = {
      name: name.trim(),
      category: category as CreateTrainingProgramData['category'],
      format: format as CreateTrainingProgramData['format'],
      durationHours: Number(durationHours),
      isMandatory,
    };

    if (description.trim()) data.description = description.trim();
    if (instructor.trim()) data.instructor = instructor.trim();
    if (maxParticipants) data.maxParticipants = Number(maxParticipants);
    if (validityMonths) data.validityMonths = Number(validityMonths);

    await onSubmit(data);
    handleClose();
  };

  const steps: WizardStep[] = [
    {
      title: 'Informações do Programa',
      description: 'Defina o nome, categoria e formato do treinamento',
      icon: (
        <BookOpen className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do programa *</Label>
            <Input
              id="name"
              placeholder="Ex: NR-35 Trabalho em Altura"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_CATEGORY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Formato *</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_FORMAT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Detalhes e Configurações',
      description: 'Descrição, duração, instrutor e configurações adicionais',
      icon: (
        <Settings className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step2Valid,
      onBack: () => setStep(1),
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o objetivo do treinamento..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationHours">Duração (horas) *</Label>
              <Input
                id="durationHours"
                type="number"
                min={1}
                placeholder="Ex: 8"
                value={durationHours}
                onChange={e => setDurationHours(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instrutor / Provedor</Label>
              <Input
                id="instructor"
                placeholder="Nome do instrutor"
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
              <Input
                id="maxParticipants"
                type="number"
                min={1}
                placeholder="Sem limite"
                value={maxParticipants}
                onChange={e => setMaxParticipants(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validityMonths">Validade (meses)</Label>
              <Input
                id="validityMonths"
                type="number"
                min={1}
                placeholder="Sem validade"
                value={validityMonths}
                onChange={e => setValidityMonths(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Switch
              id="isMandatory"
              checked={isMandatory}
              onCheckedChange={setIsMandatory}
            />
            <div>
              <Label htmlFor="isMandatory" className="cursor-pointer">
                Treinamento Obrigatório
              </Label>
              <p className="text-sm text-muted-foreground">
                Todos os funcionários devem completar este treinamento
              </p>
            </div>
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2 p-4 border-t border-border/50">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!step2Valid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Programa'
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={handleClose}
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      onClose={handleClose}
      heightClass="h-[520px]"
    />
  );
}
