/**
 * OpenSea OS - Create Medical Exam Wizard
 * Modal de criação rápida de exame médico com campos PCMSO
 */

'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { EmployeeSelector } from '@/components/shared/employee-selector';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { translateError } from '@/lib/error-messages';
import type {
  CreateMedicalExamData,
  MedicalExamType,
  MedicalExamResult,
  MedicalExamAptitude,
} from '@/types/hr';
import { Loader2, Stethoscope } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMedicalExamData) => Promise<void>;
  /**
   * Pré-seleciona o funcionário ao abrir o modal. Útil quando o
   * fluxo já está restrito a um único funcionário (ex.: timeline
   * pessoal de exames).
   */
  initialEmployeeId?: string;
}

const EXAM_TYPE_OPTIONS: { value: MedicalExamType; label: string }[] = [
  { value: 'ADMISSIONAL', label: 'Admissional' },
  { value: 'PERIODICO', label: 'Periódico' },
  { value: 'MUDANCA_FUNCAO', label: 'Mudança de Função' },
  { value: 'RETORNO', label: 'Retorno ao Trabalho' },
  { value: 'DEMISSIONAL', label: 'Demissional' },
];

const EXAM_RESULT_OPTIONS: { value: MedicalExamResult; label: string }[] = [
  { value: 'APTO', label: 'Apto' },
  { value: 'INAPTO', label: 'Inapto' },
  { value: 'APTO_COM_RESTRICOES', label: 'Apto com Restrições' },
];

const APTITUDE_OPTIONS: { value: MedicalExamAptitude; label: string }[] = [
  { value: 'APTO', label: 'Apto' },
  { value: 'INAPTO', label: 'Inapto' },
  { value: 'APTO_COM_RESTRICOES', label: 'Apto com Restrições' },
];

export function CreateModal({
  isOpen,
  onClose,
  onSubmit,
  initialEmployeeId,
}: CreateModalProps) {
  const [employeeId, setEmployeeId] = useState(initialEmployeeId ?? '');
  const [type, setType] = useState<MedicalExamType | ''>('');
  const [examDate, setExamDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorCrm, setDoctorCrm] = useState('');
  const [result, setResult] = useState<MedicalExamResult | ''>('');
  const [observations, setObservations] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  // PCMSO fields
  const [aptitude, setAptitude] = useState<MedicalExamAptitude | ''>('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [physicianName, setPhysicianName] = useState('');
  const [physicianCRM, setPhysicianCRM] = useState('');
  const [validityMonths, setValidityMonths] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [nextExamDate, setNextExamDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setEmployeeId(initialEmployeeId ?? '');
      setType('');
      setExamDate(new Date().toISOString().split('T')[0]);
      setExpirationDate('');
      setDoctorName('');
      setDoctorCrm('');
      setResult('');
      setObservations('');
      setDocumentUrl('');
      setAptitude('');
      setClinicName('');
      setClinicAddress('');
      setPhysicianName('');
      setPhysicianCRM('');
      setValidityMonths('');
      setRestrictions('');
      setNextExamDate('');
      setIsSubmitting(false);
      setFieldErrors({});
    } else if (initialEmployeeId) {
      setEmployeeId(initialEmployeeId);
    }
  }, [isOpen, initialEmployeeId]);

  const canSubmit =
    employeeId.trim() &&
    type &&
    examDate &&
    doctorName.trim() &&
    doctorCrm.trim() &&
    result;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const data: CreateMedicalExamData = {
        employeeId: employeeId.trim(),
        type: type as MedicalExamType,
        examDate,
        expirationDate: expirationDate || undefined,
        doctorName: doctorName.trim(),
        doctorCrm: doctorCrm.trim(),
        result: result as MedicalExamResult,
        observations: observations.trim() || undefined,
        documentUrl: documentUrl.trim() || undefined,
        // PCMSO fields
        examCategory: type as MedicalExamType,
        aptitude: aptitude ? (aptitude as MedicalExamAptitude) : undefined,
        clinicName: clinicName.trim() || undefined,
        clinicAddress: clinicAddress.trim() || undefined,
        physicianName: physicianName.trim() || undefined,
        physicianCRM: physicianCRM.trim() || undefined,
        validityMonths: validityMonths
          ? parseInt(validityMonths, 10)
          : undefined,
        restrictions: restrictions.trim() || undefined,
        nextExamDate: nextExamDate || undefined,
      };
      await onSubmit(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('already') || msg.includes('exists')) {
        setFieldErrors(prev => ({ ...prev, employeeId: translateError(msg) }));
      } else {
        toast.error(translateError(msg));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Dados do Exame',
        description: 'Informações básicas do exame médico ocupacional.',
        icon: <Stethoscope className="h-16 w-16 text-teal-400 opacity-50" />,
        isValid:
          !!employeeId.trim() &&
          !!type &&
          !!examDate &&
          !!doctorName.trim() &&
          !!doctorCrm.trim() &&
          !!result,
        content: (
          <div className="space-y-4 py-2">
            {/* Funcionário */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Funcionário <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <EmployeeSelector
                  value={employeeId}
                  onChange={id => {
                    setEmployeeId(id);
                    if (fieldErrors.employeeId)
                      setFieldErrors(prev => ({ ...prev, employeeId: '' }));
                  }}
                  placeholder="Selecionar funcionário..."
                />
                <FormErrorIcon message={fieldErrors.employeeId} />
              </div>
            </div>

            {/* Tipo + Resultado */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">
                  Tipo de Exame <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={type}
                  onValueChange={v => setType(v as MedicalExamType)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">
                  Resultado <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={result}
                  onValueChange={v => setResult(v as MedicalExamResult)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecionar resultado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_RESULT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Aptidão PCMSO */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Aptidão (ASO)</Label>
                <Select
                  value={aptitude}
                  onValueChange={v => setAptitude(v as MedicalExamAptitude)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecionar aptidão..." />
                  </SelectTrigger>
                  <SelectContent>
                    {APTITUDE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="validity-months" className="text-xs">
                  Validade (meses)
                </Label>
                <Input
                  id="validity-months"
                  type="number"
                  min="1"
                  value={validityMonths}
                  onChange={e => setValidityMonths(e.target.value)}
                  placeholder="12"
                  className="h-9"
                />
              </div>
            </div>

            {/* Datas */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="exam-date" className="text-xs">
                  Data do Exame <span className="text-rose-500">*</span>
                </Label>
                <DatePicker
                  id="exam-date"
                  value={examDate}
                  onChange={v => setExamDate(typeof v === 'string' ? v : '')}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="exam-expiration" className="text-xs">
                  Data de Validade
                </Label>
                <DatePicker
                  id="exam-expiration"
                  value={expirationDate}
                  onChange={v =>
                    setExpirationDate(typeof v === 'string' ? v : '')
                  }
                />
              </div>
            </div>

            {/* Próximo Exame */}
            <div className="space-y-1.5">
              <Label htmlFor="next-exam-date" className="text-xs">
                Próximo Exame Previsto
              </Label>
              <DatePicker
                id="next-exam-date"
                value={nextExamDate}
                onChange={v => setNextExamDate(typeof v === 'string' ? v : '')}
              />
            </div>

            {/* Médico Examinador */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="doctor-name" className="text-xs">
                  Médico Examinador <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="doctor-name"
                    value={doctorName}
                    aria-invalid={!!fieldErrors.doctorName}
                    onChange={e => {
                      setDoctorName(e.target.value);
                      if (fieldErrors.doctorName)
                        setFieldErrors(prev => ({ ...prev, doctorName: '' }));
                    }}
                    placeholder="Dr. Nome Completo"
                    className="h-9"
                  />
                  <FormErrorIcon message={fieldErrors.doctorName} />
                </div>
              </div>
              <div className="w-40 space-y-1.5">
                <Label htmlFor="doctor-crm" className="text-xs">
                  CRM <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="doctor-crm"
                    value={doctorCrm}
                    aria-invalid={!!fieldErrors.doctorCrm}
                    onChange={e => {
                      setDoctorCrm(e.target.value);
                      if (fieldErrors.doctorCrm)
                        setFieldErrors(prev => ({ ...prev, doctorCrm: '' }));
                    }}
                    placeholder="CRM/UF 00000"
                    className="h-9"
                  />
                  <FormErrorIcon message={fieldErrors.doctorCrm} />
                </div>
              </div>
            </div>

            {/* Médico Coordenador (PCMSO) */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="physician-name" className="text-xs">
                  Médico Coordenador (PCMSO)
                </Label>
                <Input
                  id="physician-name"
                  value={physicianName}
                  onChange={e => setPhysicianName(e.target.value)}
                  placeholder="Dr. Nome Completo"
                  className="h-9"
                />
              </div>
              <div className="w-40 space-y-1.5">
                <Label htmlFor="physician-crm" className="text-xs">
                  CRM Coordenador
                </Label>
                <Input
                  id="physician-crm"
                  value={physicianCRM}
                  onChange={e => setPhysicianCRM(e.target.value)}
                  placeholder="CRM/UF 00000"
                  className="h-9"
                />
              </div>
            </div>

            {/* Clínica */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="clinic-name" className="text-xs">
                  Clínica / Laboratório
                </Label>
                <Input
                  id="clinic-name"
                  value={clinicName}
                  onChange={e => setClinicName(e.target.value)}
                  placeholder="Nome da clínica"
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clinic-address" className="text-xs">
                Endereço da Clínica
              </Label>
              <Input
                id="clinic-address"
                value={clinicAddress}
                onChange={e => setClinicAddress(e.target.value)}
                placeholder="Endereço completo"
                className="h-9"
              />
            </div>

            {/* Restrições */}
            <div className="space-y-1.5">
              <Label htmlFor="exam-restrictions" className="text-xs">
                Restrições
              </Label>
              <Textarea
                id="exam-restrictions"
                value={restrictions}
                onChange={e => setRestrictions(e.target.value)}
                placeholder="Descreva restrições identificadas no ASO..."
                rows={2}
              />
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label htmlFor="exam-observations" className="text-xs">
                Observações
              </Label>
              <Textarea
                id="exam-observations"
                value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="Observações adicionais sobre o exame..."
                rows={2}
              />
            </div>

            {/* URL do Documento */}
            <div className="space-y-1.5">
              <Label htmlFor="exam-doc-url" className="text-xs">
                URL do Documento (ASO)
              </Label>
              <Input
                id="exam-doc-url"
                value={documentUrl}
                onChange={e => setDocumentUrl(e.target.value)}
                placeholder="https://..."
                className="h-9"
              />
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Registrando...
                </>
              ) : (
                'Registrar Exame'
              )}
            </Button>
          </div>
        ),
      },
    ],
    [
      employeeId,
      type,
      examDate,
      expirationDate,
      doctorName,
      doctorCrm,
      result,
      aptitude,
      validityMonths,
      nextExamDate,
      physicianName,
      physicianCRM,
      clinicName,
      clinicAddress,
      restrictions,
      observations,
      documentUrl,
      isSubmitting,
      canSubmit,
      onClose,
      fieldErrors,
    ]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
      steps={steps}
      currentStep={1}
      onStepChange={() => {}}
      onClose={onClose}
    />
  );
}
