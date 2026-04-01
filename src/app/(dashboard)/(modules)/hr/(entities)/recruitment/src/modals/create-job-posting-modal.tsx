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
import type { CreateJobPostingData } from '@/types/hr';
import { Briefcase, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { JOB_POSTING_TYPE_OPTIONS } from '../constants';

interface CreateJobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CreateJobPostingData) => Promise<void>;
  departments: { id: string; name: string }[];
  positions: { id: string; name: string }[];
}

export function CreateJobPostingModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
  departments,
  positions,
}: CreateJobPostingModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [benefits, setBenefits] = useState('');
  const [maxApplicants, setMaxApplicants] = useState('');

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setType('');
    setDepartmentId('');
    setPositionId('');
    setLocation('');
    setSalaryMin('');
    setSalaryMax('');
    setBenefits('');
    setMaxApplicants('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const step1Valid = title.trim().length > 0 && type.length > 0;

  const handleSubmit = async () => {
    const data: CreateJobPostingData = {
      title: title.trim(),
      type: type as CreateJobPostingData['type'],
    };

    if (description.trim()) data.description = description.trim();
    if (departmentId) data.departmentId = departmentId;
    if (positionId) data.positionId = positionId;
    if (location.trim()) data.location = location.trim();
    if (salaryMin) data.salaryMin = Number(salaryMin);
    if (salaryMax) data.salaryMax = Number(salaryMax);
    if (benefits.trim()) data.benefits = benefits.trim();
    if (maxApplicants) data.maxApplicants = Number(maxApplicants);

    await onSubmit(data);
    handleClose();
  };

  const steps: WizardStep[] = [
    {
      title: 'Informações da Vaga',
      description: 'Título, tipo, departamento e localização',
      icon: (
        <Briefcase className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="jp-title">Título da vaga *</Label>
            <Input
              id="jp-title"
              placeholder="Ex: Desenvolvedor Full Stack"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {JOB_POSTING_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jp-location">Localização</Label>
              <Input
                id="jp-location"
                placeholder="Ex: São Paulo, SP"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={positionId} onValueChange={setPositionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jp-salary-min">Salário mínimo</Label>
              <Input
                id="jp-salary-min"
                type="number"
                min={0}
                placeholder="R$ 0,00"
                value={salaryMin}
                onChange={e => setSalaryMin(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jp-salary-max">Salário máximo</Label>
              <Input
                id="jp-salary-max"
                type="number"
                min={0}
                placeholder="R$ 0,00"
                value={salaryMax}
                onChange={e => setSalaryMax(e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Descrição e Benefícios',
      description: 'Detalhes da vaga, benefícios e requisitos',
      icon: (
        <FileText className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: true,
      onBack: () => setStep(1),
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="jp-description">Descrição da vaga</Label>
            <Textarea
              id="jp-description"
              placeholder="Descreva as responsabilidades e o que procura..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jp-benefits">Benefícios</Label>
            <Textarea
              id="jp-benefits"
              placeholder="Ex: VR, VT, Plano de Saúde..."
              value={benefits}
              onChange={e => setBenefits(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jp-max-applicants">Máximo de candidatos</Label>
            <Input
              id="jp-max-applicants"
              type="number"
              min={1}
              placeholder="Sem limite"
              value={maxApplicants}
              onChange={e => setMaxApplicants(e.target.value)}
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
              'Criar Vaga'
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
