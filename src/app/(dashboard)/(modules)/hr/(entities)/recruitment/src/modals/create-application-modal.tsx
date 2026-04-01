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
import type { CreateApplicationData, JobPosting, Candidate } from '@/types/hr';
import { Briefcase, Loader2, User } from 'lucide-react';
import { useState } from 'react';

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CreateApplicationData) => Promise<void>;
  jobPostings: JobPosting[];
  candidates: Candidate[];
  /** Pre-fill job posting (from job posting detail page) */
  defaultJobPostingId?: string;
  /** Pre-fill candidate (from candidate detail page) */
  defaultCandidateId?: string;
}

export function CreateApplicationModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
  jobPostings,
  candidates,
  defaultJobPostingId,
  defaultCandidateId,
}: CreateApplicationModalProps) {
  const [step, setStep] = useState(1);
  const [jobPostingId, setJobPostingId] = useState(defaultJobPostingId ?? '');
  const [candidateId, setCandidateId] = useState(defaultCandidateId ?? '');

  const resetForm = () => {
    setStep(1);
    setJobPostingId(defaultJobPostingId ?? '');
    setCandidateId(defaultCandidateId ?? '');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const step1Valid = jobPostingId.length > 0;
  const step2Valid = candidateId.length > 0;

  const handleSubmit = async () => {
    await onSubmit({ jobPostingId, candidateId });
    handleClose();
  };

  const steps: WizardStep[] = [
    {
      title: 'Selecionar Vaga',
      description: 'Escolha a vaga para a candidatura',
      icon: (
        <Briefcase className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label>Vaga *</Label>
            <Select value={jobPostingId} onValueChange={setJobPostingId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma vaga..." />
              </SelectTrigger>
              <SelectContent>
                {jobPostings
                  .filter(jp => jp.status === 'OPEN')
                  .map(jp => (
                    <SelectItem key={jp.id} value={jp.id}>
                      {jp.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: 'Selecionar Candidato',
      description: 'Escolha o candidato para vincular à vaga',
      icon: <User className="h-16 w-16 text-violet-500 dark:text-violet-400" />,
      isValid: step2Valid,
      onBack: () => setStep(1),
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label>Candidato *</Label>
            <Select value={candidateId} onValueChange={setCandidateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um candidato..." />
              </SelectTrigger>
              <SelectContent>
                {candidates.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName} ({c.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                Criando...
              </>
            ) : (
              'Criar Candidatura'
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
      heightClass="h-[400px]"
    />
  );
}
