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
import { Textarea } from '@/components/ui/textarea';
import type { CreateCandidateData } from '@/types/hr';
import { Loader2, User, FileText } from 'lucide-react';
import { useState } from 'react';
import { CANDIDATE_SOURCE_OPTIONS } from '../constants';

interface CreateCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CreateCandidateData) => Promise<void>;
}

export function CreateCandidateModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: CreateCandidateModalProps) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [source, setSource] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const resetForm = () => {
    setStep(1);
    setFullName('');
    setEmail('');
    setPhone('');
    setCpf('');
    setSource('');
    setResumeUrl('');
    setLinkedinUrl('');
    setNotes('');
    setTagsInput('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const step1Valid =
    fullName.trim().length > 0 && email.trim().length > 0 && source.length > 0;

  const handleSubmit = async () => {
    const data: CreateCandidateData = {
      fullName: fullName.trim(),
      email: email.trim(),
      source: source as CreateCandidateData['source'],
    };

    if (phone.trim()) data.phone = phone.trim();
    if (cpf.trim()) data.cpf = cpf.trim();
    if (resumeUrl.trim()) data.resumeUrl = resumeUrl.trim();
    if (linkedinUrl.trim()) data.linkedinUrl = linkedinUrl.trim();
    if (notes.trim()) data.notes = notes.trim();
    if (tagsInput.trim()) {
      data.tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }

    await onSubmit(data);
    handleClose();
  };

  const steps: WizardStep[] = [
    {
      title: 'Dados do Candidato',
      description: 'Nome, e-mail, telefone e origem',
      icon: <User className="h-16 w-16 text-violet-500 dark:text-violet-400" />,
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="cand-name">Nome completo *</Label>
            <Input
              id="cand-name"
              placeholder="Ex: João da Silva"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cand-email">E-mail *</Label>
              <Input
                id="cand-email"
                type="email"
                placeholder="joao@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cand-phone">Telefone</Label>
              <Input
                id="cand-phone"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cand-cpf">CPF</Label>
              <Input
                id="cand-cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={e => setCpf(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Origem *</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CANDIDATE_SOURCE_OPTIONS.map(opt => (
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
      title: 'Informações Adicionais',
      description: 'Currículo, LinkedIn, tags e observações',
      icon: (
        <FileText className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: true,
      onBack: () => setStep(1),
      content: (
        <div className="space-y-4 p-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cand-resume">URL do currículo</Label>
              <Input
                id="cand-resume"
                placeholder="https://..."
                value={resumeUrl}
                onChange={e => setResumeUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cand-linkedin">LinkedIn</Label>
              <Input
                id="cand-linkedin"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cand-tags">Tags (separadas por vírgula)</Label>
            <Input
              id="cand-tags"
              placeholder="Ex: react, senior, remoto"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cand-notes">Observações</Label>
            <Textarea
              id="cand-notes"
              placeholder="Observações sobre o candidato..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2 p-4 border-t border-border/50">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Candidato'
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
