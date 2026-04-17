'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { translateError } from '@/lib/error-messages';
import type { CreateShiftData, ShiftType } from '@/types/hr';
import { SHIFT_TYPE_LABELS } from '../config';
import { Clock, Loader2, Timer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface CreateShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShiftData) => Promise<void>;
  isLoading?: boolean;
}

const SHIFT_TYPE_OPTIONS: { value: ShiftType; label: string }[] = [
  { value: 'FIXED', label: 'Fixo' },
  { value: 'ROTATING', label: 'Rotativo' },
  { value: 'FLEXIBLE', label: 'Flexível' },
  { value: 'ON_CALL', label: 'Sobreaviso' },
];

export function CreateShiftModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateShiftModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ShiftType | ''>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('60');
  const [isNightShift, setIsNightShift] = useState(false);
  const [color, setColor] = useState('#6366F1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setName('');
      setCode('');
      setType('');
      setStartTime('');
      setEndTime('');
      setBreakMinutes('60');
      setIsNightShift(false);
      setColor('#6366F1');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  async function handleSubmit() {
    if (!name || !type || !startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        code: code || undefined,
        type: type as ShiftType,
        startTime,
        endTime,
        breakMinutes: Number(breakMinutes) || 60,
        isNightShift,
        color: color || undefined,
      });

      toast.success('Turno criado com sucesso');
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
        title: 'Informações do Turno',
        description: 'Nome, código e tipo do turno',
        icon: <Clock className="h-16 w-16 text-sky-400 opacity-50" />,
        isValid: !!name && !!type,
        content: (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">
                Nome do Turno <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Turno da Manhã"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Código (opcional)</Label>
              <Input
                placeholder="Ex: TM01"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={32}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">
                Tipo de Turno <span className="text-rose-500">*</span>
              </Label>
              <Select value={type} onValueChange={v => setType(v as ShiftType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {SHIFT_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Cor</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-md border border-input"
                />
                <span className="text-sm text-muted-foreground">{color}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Horários',
        description: 'Início, término e intervalo',
        icon: <Timer className="h-16 w-16 text-indigo-400 opacity-50" />,
        isValid: !!startTime && !!endTime,
        footer: (
          <Button
            onClick={handleSubmit}
            disabled={
              !name ||
              !type ||
              !startTime ||
              !endTime ||
              isSubmitting ||
              isLoading
            }
            className="w-full"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Turno'
            )}
          </Button>
        ),
        content: (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">
                  Hora de Início <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">
                  Hora de Término <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Intervalo (minutos)</Label>
              <Input
                type="number"
                min={0}
                max={480}
                value={breakMinutes}
                onChange={e => setBreakMinutes(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Turno noturno</p>
                <p className="text-xs text-muted-foreground">
                  Período predominantemente noturno (22h às 5h)
                </p>
              </div>
              <Switch
                checked={isNightShift}
                onCheckedChange={setIsNightShift}
              />
            </div>

            {startTime && endTime && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium">Resumo</p>
                <p className="text-sm text-muted-foreground">
                  {startTime} — {endTime} | Intervalo: {breakMinutes}min
                  {isNightShift && ' | Noturno'}
                  {type && ` | ${SHIFT_TYPE_LABELS[type]}`}
                </p>
              </div>
            )}
          </div>
        ),
      },
    ],
    [
      name,
      code,
      type,
      startTime,
      endTime,
      breakMinutes,
      isNightShift,
      color,
      isSubmitting,
      isLoading,
    ]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={onClose}
    />
  );
}
