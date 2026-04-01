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
import { Badge } from '@/components/ui/badge';
import type { CreateSurveyData } from '@/types/hr';
import { ClipboardList, Eye, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  SURVEY_TYPE_OPTIONS,
  SURVEY_TYPE_LABELS,
  SURVEY_TYPE_COLORS,
} from '../constants';
import type { SurveyType } from '@/types/hr';

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CreateSurveyData) => Promise<void>;
}

export function CreateSurveyModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: CreateSurveyModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setType('');
    setIsAnonymous(false);
    setStartDate('');
    setEndDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const step1Valid = title.trim().length > 0 && type.length > 0;

  const handleSubmit = async () => {
    const data: CreateSurveyData = {
      title: title.trim(),
      type: type as CreateSurveyData['type'],
      isAnonymous,
    };

    if (description.trim()) data.description = description.trim();
    if (startDate) data.startDate = new Date(startDate).toISOString();
    if (endDate) data.endDate = new Date(endDate).toISOString();

    await onSubmit(data);
    handleClose();
  };

  const typeColors = type ? SURVEY_TYPE_COLORS[type as SurveyType] : undefined;

  const steps: WizardStep[] = [
    {
      title: 'Informações da Pesquisa',
      description: 'Defina o título, tipo e configurações da pesquisa',
      icon: (
        <ClipboardList className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="title">Título da pesquisa *</Label>
            <Input
              id="title"
              placeholder="Ex: Pesquisa de Clima Organizacional 2026"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o objetivo da pesquisa..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo da pesquisa *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {SURVEY_TYPE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de término</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Switch
              id="isAnonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <div>
              <Label htmlFor="isAnonymous" className="cursor-pointer">
                Pesquisa Anônima
              </Label>
              <p className="text-sm text-muted-foreground">
                As respostas não serão vinculadas aos funcionários
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Revisão e Confirmação',
      description: 'Confira os dados antes de criar a pesquisa',
      icon: <Eye className="h-16 w-16 text-violet-500 dark:text-violet-400" />,
      isValid: true,
      onBack: () => setStep(1),
      content: (
        <div className="space-y-4 p-1">
          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <span className="text-xs text-muted-foreground">Título</span>
              <p className="font-medium">{title || '—'}</p>
            </div>

            {description && (
              <div>
                <span className="text-xs text-muted-foreground">Descrição</span>
                <p className="text-sm">{description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {type && typeColors && (
                <Badge
                  variant="outline"
                  className={`${typeColors.bg} ${typeColors.text} border-0`}
                >
                  {SURVEY_TYPE_LABELS[type as SurveyType]}
                </Badge>
              )}
              {isAnonymous && (
                <Badge
                  variant="outline"
                  className="bg-sky-50 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300 border-0"
                >
                  Anônima
                </Badge>
              )}
            </div>

            {(startDate || endDate) && (
              <div className="flex gap-4 text-sm">
                {startDate && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Início
                    </span>
                    <p>{new Date(startDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {endDate && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Término
                    </span>
                    <p>{new Date(endDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            A pesquisa será criada como rascunho. Adicione perguntas e ative-a
            quando estiver pronta.
          </p>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2 p-4 border-t border-border/50">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!step1Valid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Pesquisa'
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
      heightClass="h-[560px]"
    />
  );
}
