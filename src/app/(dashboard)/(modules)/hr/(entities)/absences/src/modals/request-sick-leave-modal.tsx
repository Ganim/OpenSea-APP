'use client';

/**
 * OpenSea OS - Request Sick Leave Modal (HR)
 *
 * Wizard de 2 passos para registrar atestado médico:
 *  1. Colaborador e período
 *  2. Dados do atestado médico (CID, motivo, documento)
 */

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { EmployeeSelector } from '@/components/shared/employee-selector';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Textarea } from '@/components/ui/textarea';
import { translateError } from '@/lib/error-messages';
import { FileHeart, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { useRequestSickLeave } from '../api';

interface RequestSickLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
}

export function RequestSickLeaveModal({
  isOpen,
  onClose,
  employeeId,
}: RequestSickLeaveModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formEmployeeId, setFormEmployeeId] = useState(employeeId ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cid, setCid] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [reason, setReason] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const requestSickLeave = useRequestSickLeave({
    onSuccess: () => {
      resetForm();
      onClose();
    },
    onError: (error: Error) => {
      const msg = error.message;
      if (
        msg.includes('date') ||
        msg.includes('data') ||
        msg.includes('overlap')
      ) {
        setFieldErrors(prev => ({ ...prev, startDate: translateError(msg) }));
        setCurrentStep(1);
      } else if (msg.includes('CID') || msg.includes('cid')) {
        setFieldErrors(prev => ({ ...prev, cid: translateError(msg) }));
        setCurrentStep(2);
      } else {
        toast.error(translateError(msg));
      }
    },
  });

  function resetForm() {
    setFormEmployeeId(employeeId ?? '');
    setStartDate('');
    setEndDate('');
    setCid('');
    setDocumentUrl('');
    setReason('');
    setFieldErrors({});
    setCurrentStep(1);
  }

  function handleSubmit() {
    if (!formEmployeeId || !startDate || !endDate || !cid || !reason) return;

    requestSickLeave.mutate({
      employeeId: formEmployeeId,
      startDate,
      endDate,
      cid,
      documentUrl: documentUrl || undefined,
      reason,
    });
  }

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Colaborador e período',
        description: 'Selecione o colaborador e o intervalo do afastamento.',
        icon: (
          <FileHeart className="h-16 w-16 text-rose-400" strokeWidth={1.2} />
        ),
        isValid: !!(formEmployeeId && startDate && endDate),
        content: (
          <div className="space-y-4 py-2">
            {!employeeId && (
              <div className="space-y-2">
                <Label>Funcionário *</Label>
                <EmployeeSelector
                  value={formEmployeeId}
                  onChange={id => setFormEmployeeId(id)}
                  placeholder="Selecionar funcionário..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sick-start-date">Data Início *</Label>
                <div className="relative">
                  <DatePicker
                    id="sick-start-date"
                    value={startDate}
                    onChange={v => {
                      const val = typeof v === 'string' ? v : '';
                      setStartDate(val);
                      if (fieldErrors.startDate)
                        setFieldErrors(prev => ({ ...prev, startDate: '' }));
                    }}
                  />
                  <FormErrorIcon message={fieldErrors.startDate} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sick-end-date">Data Fim *</Label>
                <DatePicker
                  id="sick-end-date"
                  value={endDate}
                  onChange={v => setEndDate(typeof v === 'string' ? v : '')}
                  fromDate={startDate ? new Date(startDate) : undefined}
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Atestado médico',
        description:
          'Informe o CID, o motivo e o link do documento (quando aplicável).',
        icon: (
          <Stethoscope className="h-16 w-16 text-rose-400" strokeWidth={1.2} />
        ),
        isValid: !!(cid && reason),
        content: (
          <div className="space-y-4 py-2">
            <div className="flex gap-4">
              <div className="space-y-2 w-40">
                <Label htmlFor="sick-cid">CID (Código) *</Label>
                <div className="relative">
                  <Input
                    id="sick-cid"
                    value={cid}
                    onChange={e => {
                      setCid(e.target.value);
                      if (fieldErrors.cid)
                        setFieldErrors(prev => ({ ...prev, cid: '' }));
                    }}
                    placeholder="Ex.: J11, A09"
                    required
                    aria-invalid={!!fieldErrors.cid}
                  />
                  <FormErrorIcon message={fieldErrors.cid} />
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="sick-document-url">
                  URL do Documento (opcional)
                </Label>
                <Input
                  id="sick-document-url"
                  value={documentUrl}
                  onChange={e => setDocumentUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sick-reason">Motivo / Observações *</Label>
              <Textarea
                id="sick-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Descreva o motivo do atestado..."
                rows={3}
                required
              />
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              ← Voltar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!cid || !reason || requestSickLeave.isPending}
            >
              <FileHeart className="h-4 w-4 mr-2" />
              {requestSickLeave.isPending
                ? 'Registrando...'
                : 'Registrar Atestado'}
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      employeeId,
      formEmployeeId,
      startDate,
      endDate,
      cid,
      documentUrl,
      reason,
      fieldErrors,
      requestSickLeave.isPending,
    ]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}

export default RequestSickLeaveModal;
