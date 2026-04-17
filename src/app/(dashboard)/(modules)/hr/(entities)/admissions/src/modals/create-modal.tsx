'use client';

import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ADMISSION_DOCS_CHECKLIST,
  DocsChecklistStep,
  areRequiredDocsComplete,
} from '@/components/hr/docs-checklist-step';
import { DraftRestoreToast } from '@/components/hr/draft-restore-toast';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { useAuth } from '@/contexts/auth-context';
import {
  type AdmissionDocChecklistEntry,
  clearDraft,
  hasDraft,
  loadDraft,
  saveDraft,
} from '@/lib/hr/admission-draft';
import { translateError } from '@/lib/error-messages';
import type { CreateAdmissionData, ContractType, WorkRegime } from '@/types/hr';
import {
  AlertTriangle,
  Briefcase,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  ExternalLink,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CONTRACT_TYPE_LABELS, WORK_REGIME_LABELS } from '../utils';

// Department and Position selectors
import { useQuery } from '@tanstack/react-query';
import { departmentsService, positionsService } from '@/services/hr';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdmissionData) => Promise<unknown>;
  isSubmitting: boolean;
}

const CONTRACT_TYPE_OPTIONS: { value: ContractType; label: string }[] =
  Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => ({
    value: value as ContractType,
    label,
  }));

const WORK_REGIME_OPTIONS: { value: WorkRegime; label: string }[] =
  Object.entries(WORK_REGIME_LABELS).map(([value, label]) => ({
    value: value as WorkRegime,
    label,
  }));

const DRAFT_AUTOSAVE_DEBOUNCE_MS = 1000;

export function CreateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateModalProps) {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  // ---- Step 1: Docs Checklist ----
  const [docEntries, setDocEntries] = useState<
    Record<string, AdmissionDocChecklistEntry>
  >({});
  const [allowMissingDocs, setAllowMissingDocs] = useState(false);

  // ---- Step 2: Candidate info ----
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ---- Step 3: Position/contract ----
  const [positionId, setPositionId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [salary, setSalary] = useState('');
  const [contractType, setContractType] = useState<ContractType | ''>('');
  const [workRegime, setWorkRegime] = useState<WorkRegime | ''>('');

  // ---- Wizard control ----
  const [currentStep, setCurrentStep] = useState(1);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // ---- Draft restore state ----
  const [showRestoreToast, setShowRestoreToast] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);

  // ---- PIN confirmation ----
  const [isPinOpen, setIsPinOpen] = useState(false);

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch departments and positions
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: async () => {
      const res = await departmentsService.listDepartments({ perPage: 100 });
      return (
        (res as { departments?: { id: string; name: string }[] }).departments ??
        []
      );
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions', 'all'],
    queryFn: async () => {
      const res = await positionsService.listPositions({ perPage: 100 });
      return (
        (res as { positions?: { id: string; name: string }[] }).positions ?? []
      );
    },
    staleTime: 10 * 60 * 1000,
  });

  const departments = departmentsData ?? [];
  const positions = positionsData ?? [];

  // ============================================================================
  // DRAFT — RESTORE ON OPEN
  // ============================================================================

  useEffect(() => {
    if (!isOpen || !userId || hasResumed) return;
    if (hasDraft(userId)) {
      setShowRestoreToast(true);
    }
  }, [isOpen, userId, hasResumed]);

  const handleResumeDraft = useCallback(() => {
    if (!userId) return;
    const draft = loadDraft(userId);
    if (!draft) {
      setShowRestoreToast(false);
      return;
    }
    setDocEntries(draft.docs ?? {});
    setAllowMissingDocs(draft.allowMissingDocs ?? false);
    setFullName(draft.fullName ?? '');
    setEmail(draft.email ?? '');
    setPhone(draft.phone ?? '');
    setPositionId(draft.positionId ?? '');
    setDepartmentId(draft.departmentId ?? '');
    setExpectedStartDate(draft.expectedStartDate ?? '');
    setSalary(draft.salary ?? '');
    setContractType(draft.contractType ?? '');
    setWorkRegime(draft.workRegime ?? '');
    setCurrentStep(draft.currentStep ?? 1);
    setHasResumed(true);
    setShowRestoreToast(false);
    toast.success('Rascunho restaurado');
  }, [userId]);

  const handleDiscardDraft = useCallback(() => {
    setShowRestoreToast(false);
    setHasResumed(true);
  }, []);

  // ============================================================================
  // DRAFT — AUTOSAVE (debounced)
  // ============================================================================

  useEffect(() => {
    if (!isOpen || !userId) return;
    // Skip autosave on the success step (token already created — discarding draft)
    if (currentStep === 4) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      saveDraft(userId, {
        currentStep,
        allowMissingDocs,
        docs: docEntries,
        fullName,
        email,
        phone,
        positionId,
        departmentId,
        expectedStartDate,
        salary,
        contractType,
        workRegime,
      });
    }, DRAFT_AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    isOpen,
    userId,
    currentStep,
    allowMissingDocs,
    docEntries,
    fullName,
    email,
    phone,
    positionId,
    departmentId,
    expectedStartDate,
    salary,
    contractType,
    workRegime,
  ]);

  // ============================================================================
  // RESET / CLOSE
  // ============================================================================

  const resetForm = useCallback(() => {
    setDocEntries({});
    setAllowMissingDocs(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setFieldErrors({});
    setPositionId('');
    setDepartmentId('');
    setExpectedStartDate('');
    setSalary('');
    setContractType('');
    setWorkRegime('');
    setCurrentStep(1);
    setCreatedToken(null);
    setCopiedLink(false);
    setHasResumed(false);
    setShowRestoreToast(false);
  }, []);

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const performSubmit = useCallback(async () => {
    if (
      !fullName ||
      !email ||
      !positionId ||
      !departmentId ||
      !expectedStartDate ||
      !contractType ||
      !workRegime
    )
      return;

    const data: CreateAdmissionData = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      positionId,
      departmentId,
      expectedStartDate,
      salary: salary ? parseFloat(salary) : undefined,
      contractType: contractType as ContractType,
      workRegime: workRegime as WorkRegime,
    };

    try {
      const result = (await onSubmit(data)) as { token?: string } | undefined;
      if (result?.token) {
        setCreatedToken(result.token);
        setCurrentStep(4);
        // Clear the draft on success — the wizard's job is done.
        if (userId) clearDraft(userId);
        return;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('email') || msg.includes('e-mail')) {
        setFieldErrors(prev => ({ ...prev, email: translateError(msg) }));
        setCurrentStep(2);
      } else {
        toast.error(translateError(msg));
      }
    }
  }, [
    fullName,
    email,
    phone,
    positionId,
    departmentId,
    expectedStartDate,
    salary,
    contractType,
    workRegime,
    onSubmit,
    userId,
  ]);

  const handleRequestSubmit = useCallback(() => {
    setIsPinOpen(true);
  }, []);

  const handlePinSuccess = useCallback(async () => {
    setIsPinOpen(false);
    await performSubmit();
  }, [performSubmit]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const docsRequiredComplete = useMemo(
    () => areRequiredDocsComplete(docEntries),
    [docEntries]
  );
  const stepDocsValid = docsRequiredComplete || allowMissingDocs;

  const stepCandidateValid =
    !!fullName.trim() && !!email.trim() && email.includes('@');

  const stepContractValid =
    !!positionId &&
    !!departmentId &&
    !!expectedStartDate &&
    !!contractType &&
    !!workRegime;

  // ============================================================================
  // SUMMARY HELPERS
  // ============================================================================

  const docsSummary = useMemo(() => {
    const required: { type: string; label: string; ok: boolean }[] = [];
    const optional: { type: string; label: string; ok: boolean }[] = [];
    for (const group of ADMISSION_DOCS_CHECKLIST) {
      for (const doc of group.documents) {
        const entry = docEntries[doc.type];
        const ok =
          !!entry && entry.status !== 'pending' && entry.status !== 'rejected';
        const row = { type: doc.type, label: doc.label, ok };
        if (doc.required) required.push(row);
        else optional.push(row);
      }
    }
    return { required, optional };
  }, [docEntries]);

  // ============================================================================
  // STEPS
  // ============================================================================

  const steps: WizardStep[] = [
    // -------- Step 1: Docs Checklist --------
    {
      title: 'Documentos Obrigatórios',
      description:
        'Anexe os documentos necessários para iniciar a admissão (CLT)',
      icon: <ClipboardList className="h-16 w-16 text-violet-500/60" />,
      content: (
        <DocsChecklistStep
          entries={docEntries}
          onEntriesChange={setDocEntries}
          allowMissingDocs={allowMissingDocs}
          onAllowMissingDocsChange={setAllowMissingDocs}
          disabled={isSubmitting}
        />
      ),
      isValid: stepDocsValid,
    },

    // -------- Step 2: Candidate info --------
    {
      title: 'Dados do Candidato',
      description: 'Informações básicas do candidato',
      icon: <UserPlus className="h-16 w-16 text-blue-500/60" />,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label className="text-xs">
              Nome Completo <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nome completo do candidato"
                className="h-9"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-xs">
                E-mail <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (fieldErrors.email)
                      setFieldErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="email@exemplo.com"
                  className="h-9"
                />
                <FormErrorIcon message={fieldErrors.email || ''} />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-xs">Telefone</Label>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="h-9"
              />
            </div>
          </div>

          <Card className="p-4 bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20">
            <div className="flex gap-3">
              <UserPlus className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Admissão Digital
                </p>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                  Um link de admissão será enviado ao candidato para que ele
                  preencha seus dados pessoais, envie documentos e assine
                  digitalmente.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ),
      isValid: stepCandidateValid,
    },

    // -------- Step 3: Vaga e Contrato + Revisão --------
    {
      title: 'Vaga e Contrato',
      description: 'Cargo, departamento, condições e revisão final',
      icon: <Briefcase className="h-16 w-16 text-blue-500/60" />,
      content: (
        <div className="space-y-4 p-1">
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-xs">
                Departamento <span className="text-rose-500">*</span>
              </Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecionar departamento..." />
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
            <div className="flex-1 space-y-2">
              <Label className="text-xs">
                Cargo <span className="text-rose-500">*</span>
              </Label>
              <Select value={positionId} onValueChange={setPositionId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecionar cargo..." />
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

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-xs">
                Tipo de Contrato <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={contractType}
                onValueChange={v => setContractType(v as ContractType)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-xs">
                Regime de Trabalho <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={workRegime}
                onValueChange={v => setWorkRegime(v as WorkRegime)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {WORK_REGIME_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="start-date" className="text-xs">
                Data de Início Prevista <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                id="start-date"
                value={expectedStartDate}
                onChange={v =>
                  setExpectedStartDate(typeof v === 'string' ? v : '')
                }
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="salary" className="text-xs">
                Salário (R$)
              </Label>
              <Input
                id="salary"
                type="number"
                min="0"
                step="0.01"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                placeholder="0,00"
                className="h-9"
              />
            </div>
          </div>

          {/* Resumo dos documentos */}
          <Card
            className="p-4 bg-white dark:bg-slate-800/60 border border-border"
            data-testid="admission-review-docs"
          >
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <h4 className="text-sm font-semibold">Resumo dos documentos</h4>
            </div>
            <div className="space-y-2">
              {docsSummary.required.map(row => (
                <div
                  key={row.type}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-foreground truncate">{row.label}</span>
                  {row.ok ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Anexado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 shrink-0">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Pendente
                    </span>
                  )}
                </div>
              ))}
              {docsSummary.optional.some(r => r.ok) && (
                <div className="pt-2 mt-2 border-t border-border/50 space-y-2">
                  {docsSummary.optional
                    .filter(r => r.ok)
                    .map(row => (
                      <div
                        key={row.type}
                        className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
                      >
                        <span className="truncate">{row.label}</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Anexado
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {!docsRequiredComplete && allowMissingDocs && (
              <p className="mt-3 text-[11px] text-amber-700 dark:text-amber-300">
                Você optou por concluir mesmo com documentos pendentes — esta
                escolha será registrada no log de auditoria.
              </p>
            )}
          </Card>
        </div>
      ),
      isValid: stepContractValid,
      footer: (
        <div className="flex items-center justify-between gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isSubmitting}
          >
            ← Voltar
          </Button>
          <Button
            onClick={handleRequestSubmit}
            disabled={isSubmitting || !stepContractValid}
            data-testid="admission-submit-button"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Concluir admissão
          </Button>
        </div>
      ),
    },

    // -------- Step 4: Success — show link --------
    {
      title: 'Convite Criado',
      description: 'Compartilhe o link com o candidato',
      icon: <Check className="h-16 w-16 text-emerald-500/60" />,
      content: (
        <div className="space-y-5 p-1">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
              <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Convite criado com sucesso!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                O candidato{' '}
                <span className="font-medium text-foreground">{fullName}</span>{' '}
                poderá acessar o formulário de admissão pelo link abaixo.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Link do Convite</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border bg-muted/50 px-3 py-3 overflow-hidden">
                <p className="text-sm font-mono truncate">
                  {createdToken
                    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/admission/${createdToken}`
                    : '...'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 shrink-0 gap-2"
                onClick={() => {
                  const link = `${window.location.origin}/admission/${createdToken}`;
                  navigator.clipboard.writeText(link);
                  setCopiedLink(true);
                  toast.success('Link copiado para a área de transferência');
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedLink ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          <Card className="p-4 bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20">
            <div className="flex gap-3">
              <ExternalLink className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Envio manual necessário
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                  O envio automático por e-mail ainda não está configurado.
                  Copie o link acima e envie diretamente ao candidato por
                  e-mail, WhatsApp ou outro canal.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ),
      isValid: true,
      footer: <Button onClick={handleClose}>Fechar</Button>,
    },
  ];

  return (
    <>
      <StepWizardDialog
        open={isOpen}
        onOpenChange={open => {
          if (!open) handleClose();
        }}
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onClose={handleClose}
        heightClass="h-[600px]"
      />

      {/* Restore-draft toast */}
      <DraftRestoreToast
        open={showRestoreToast}
        userId={userId}
        draft={userId ? loadDraft(userId) : null}
        onResume={handleResumeDraft}
        onDiscard={handleDiscardDraft}
      />

      {/* PIN confirmation — admissão tem efeito legal/CLT */}
      <VerifyActionPinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onSuccess={handlePinSuccess}
        title="Confirmar conclusão da admissão"
        description={`Digite seu PIN de ação para concluir a admissão de ${fullName.trim() || 'o candidato'}. Esta ação cria o convite legal de admissão e fica registrada no log de auditoria.`}
      />
    </>
  );
}
