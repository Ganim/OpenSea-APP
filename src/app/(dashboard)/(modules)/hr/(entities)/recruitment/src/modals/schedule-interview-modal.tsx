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
import type { ScheduleInterviewData, InterviewStage } from '@/types/hr';
import { Calendar, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: ScheduleInterviewData) => Promise<void>;
  applicationId: string;
  stages: InterviewStage[];
  interviewers: { id: string; fullName: string }[];
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
  applicationId,
  stages,
  interviewers,
}: ScheduleInterviewModalProps) {
  const [step, setStep] = useState(1);
  const [interviewStageId, setInterviewStageId] = useState('');
  const [interviewerId, setInterviewerId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');

  const resetForm = () => {
    setStep(1);
    setInterviewStageId('');
    setInterviewerId('');
    setScheduledAt('');
    setDuration('60');
    setLocation('');
    setMeetingUrl('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const step1Valid = interviewStageId.length > 0 && interviewerId.length > 0;
  const step2Valid = scheduledAt.length > 0 && Number(duration) > 0;

  const handleSubmit = async () => {
    const data: ScheduleInterviewData = {
      applicationId,
      interviewStageId,
      interviewerId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      duration: Number(duration),
    };

    if (location.trim()) data.location = location.trim();
    if (meetingUrl.trim()) data.meetingUrl = meetingUrl.trim();

    await onSubmit(data);
    handleClose();
  };

  const steps: WizardStep[] = [
    {
      title: 'Etapa e Entrevistador',
      description: 'Selecione a etapa e quem conduzirá a entrevista',
      icon: (
        <Calendar className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label>Etapa *</Label>
            <Select
              value={interviewStageId}
              onValueChange={setInterviewStageId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a etapa..." />
              </SelectTrigger>
              <SelectContent>
                {stages.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Entrevistador *</Label>
            <Select value={interviewerId} onValueChange={setInterviewerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o entrevistador..." />
              </SelectTrigger>
              <SelectContent>
                {interviewers.map(i => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: 'Data e Local',
      description: 'Defina quando e onde será a entrevista',
      icon: (
        <MapPin className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step2Valid,
      onBack: () => setStep(1),
      content: (
        <div className="space-y-4 p-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iv-date">Data e hora *</Label>
              <Input
                id="iv-date"
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iv-duration">Duração (minutos) *</Label>
              <Input
                id="iv-duration"
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iv-location">Local</Label>
            <Input
              id="iv-location"
              placeholder="Ex: Sala de reuniões 3"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iv-url">Link da reunião</Label>
            <Input
              id="iv-url"
              placeholder="https://meet.google.com/..."
              value={meetingUrl}
              onChange={e => setMeetingUrl(e.target.value)}
            />
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2 p-4 border-t border-border/50">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!step2Valid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agendando...
              </>
            ) : (
              'Agendar Entrevista'
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
      heightClass="h-[460px]"
    />
  );
}
