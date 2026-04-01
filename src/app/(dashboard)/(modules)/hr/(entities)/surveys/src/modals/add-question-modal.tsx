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
import type { AddSurveyQuestionData, SurveyQuestionType } from '@/types/hr';
import { HelpCircle, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { QUESTION_TYPE_OPTIONS, QUESTION_CATEGORY_OPTIONS } from '../constants';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: AddSurveyQuestionData) => Promise<void>;
  nextOrder: number;
}

export function AddQuestionModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
  nextOrder,
}: AddQuestionModalProps) {
  const [step, setStep] = useState(1);
  const [text, setText] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [category, setCategory] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [options, setOptions] = useState<string[]>(['']);

  const resetForm = () => {
    setStep(1);
    setText('');
    setQuestionType('');
    setCategory('');
    setIsRequired(true);
    setOptions(['']);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isMultipleChoice = questionType === 'MULTIPLE_CHOICE';
  const validOptions = options.filter(o => o.trim().length > 0);
  const step1Valid =
    text.trim().length > 0 &&
    questionType.length > 0 &&
    (!isMultipleChoice || validOptions.length >= 2);

  const handleAddOption = () => {
    setOptions(prev => [...prev, '']);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    setOptions(prev => prev.map((o, i) => (i === index ? value : o)));
  };

  const handleSubmit = async () => {
    const data: AddSurveyQuestionData = {
      text: text.trim(),
      type: questionType as SurveyQuestionType,
      isRequired,
      order: nextOrder,
    };

    if (category) {
      data.category = category as AddSurveyQuestionData['category'];
    }

    if (isMultipleChoice && validOptions.length >= 2) {
      data.options = validOptions;
    }

    await onSubmit(data);
    handleClose();
  };

  const steps: WizardStep[] = [
    {
      title: 'Nova Pergunta',
      description: 'Defina o texto, tipo e opções da pergunta',
      icon: (
        <HelpCircle className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="questionText">Texto da pergunta *</Label>
            <Textarea
              id="questionText"
              placeholder="Ex: Como você avalia o ambiente de trabalho?"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={2}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de resposta *</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_CATEGORY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isMultipleChoice && (
            <div className="space-y-2">
              <Label>Opções de resposta *</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Opção ${index + 1}`}
                      value={option}
                      onChange={e => handleOptionChange(index, e.target.value)}
                    />
                    {options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 px-2.5"
                  onClick={handleAddOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Opção
                </Button>
              </div>
              {isMultipleChoice && validOptions.length < 2 && (
                <p className="text-xs text-muted-foreground">
                  Adicione pelo menos 2 opções de resposta.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Switch
              id="isRequired"
              checked={isRequired}
              onCheckedChange={setIsRequired}
            />
            <div>
              <Label htmlFor="isRequired" className="cursor-pointer">
                Pergunta Obrigatória
              </Label>
              <p className="text-sm text-muted-foreground">
                O respondente deve responder esta pergunta
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
          <Button onClick={handleSubmit} disabled={!step1Valid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adicionando...
              </>
            ) : (
              'Adicionar Pergunta'
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
