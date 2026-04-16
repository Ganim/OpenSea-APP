'use client';

/**
 * CreateAnnouncementModal
 *
 * 3-step wizard backed by `StepWizardDialog`:
 *  1. Conteudo  — title, content, priority
 *  2. Audiencia — broadcast toggle + AudienceSelector (depts/teams/cargos/colabs)
 *  3. Agendamento — publish now/later + optional expiration date
 *
 * Reference: Notion broadcast composer + Slack #announcement workflow.
 */

import {
  AudienceSelector,
  type AudienceSelection,
} from '@/components/hr/audience-selector';
import { Button } from '@/components/ui/button';
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
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Switch } from '@/components/ui/switch';
import { translateError } from '@/lib/error-messages';
import { cn } from '@/lib/utils';
import type { AnnouncementPriority, CreateAnnouncementData } from '@/types/hr';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  Info,
  Loader2,
  Megaphone,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CreateAnnouncementData) => Promise<void>;
}

const EMPTY_AUDIENCE: AudienceSelection = {
  departments: [],
  teams: [],
  roles: [],
  employees: [],
};

const PRIORITY_OPTIONS: Array<{
  value: AnnouncementPriority;
  label: string;
  icon: typeof Bell;
  hint: string;
  chipClass: string;
}> = [
  {
    value: 'NORMAL',
    label: 'Normal',
    icon: Bell,
    hint: 'Aviso informativo padrao',
    chipClass: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  {
    value: 'IMPORTANT',
    label: 'Importante',
    icon: Info,
    hint: 'Acao recomendada por parte do colaborador',
    chipClass: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    value: 'URGENT',
    label: 'Urgente',
    icon: AlertTriangle,
    hint: 'Requer leitura imediata',
    chipClass: 'border-rose-200 bg-rose-50 text-rose-700',
  },
];

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: CreateAnnouncementModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('NORMAL');
  const [broadcastToAll, setBroadcastToAll] = useState(true);
  const [audience, setAudience] = useState<AudienceSelection>(EMPTY_AUDIENCE);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [publishedAt, setPublishedAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Reset when modal opens
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setCurrentStep(1);
    setTitle('');
    setContent('');
    setPriority('NORMAL');
    setBroadcastToAll(true);
    setAudience(EMPTY_AUDIENCE);
    setScheduleMode('now');
    setPublishedAt('');
    setExpiresAt('');
    setFieldErrors({});
  }
  if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  // Focus title input on step 1
  useEffect(() => {
    if (currentStep === 1 && isOpen) {
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  const audienceHasAny =
    broadcastToAll ||
    audience.departments.length > 0 ||
    audience.teams.length > 0 ||
    audience.roles.length > 0 ||
    audience.employees.length > 0;

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    if (!audienceHasAny) {
      toast.error('Selecione pelo menos uma audiencia.');
      setCurrentStep(2);
      return;
    }

    const payload: CreateAnnouncementData = {
      title: title.trim(),
      content: content.trim(),
      priority,
      publishNow: scheduleMode === 'now',
    };

    if (scheduleMode === 'later' && publishedAt) {
      payload.publishedAt = new Date(publishedAt).toISOString();
    }
    if (expiresAt) {
      payload.expiresAt = new Date(expiresAt).toISOString();
    }
    if (!broadcastToAll) {
      if (audience.departments.length > 0)
        payload.targetDepartmentIds = audience.departments;
      if (audience.teams.length > 0) payload.targetTeamIds = audience.teams;
      if (audience.roles.length > 0) payload.targetRoleIds = audience.roles;
      if (audience.employees.length > 0)
        payload.targetEmployeeIds = audience.employees;
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('title') || msg.includes('titulo')) {
        setFieldErrors(prev => ({ ...prev, title: translateError(msg) }));
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  const steps: WizardStep[] = useMemo(
    () => [
      // -----------------------------------------------------------------------
      // Step 1 — Content
      // -----------------------------------------------------------------------
      {
        title: 'Conteudo do comunicado',
        description: 'Titulo, mensagem e prioridade',
        icon: <Megaphone className="h-16 w-16 text-violet-500/60" />,
        isValid: !!title.trim() && !!content.trim(),
        content: (
          <div className="flex flex-col h-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">
                Titulo <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  ref={titleInputRef}
                  id="announcement-title"
                  placeholder="Ex.: Manutencao programada do ERP"
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    if (fieldErrors.title)
                      setFieldErrors(prev => ({ ...prev, title: '' }));
                  }}
                  aria-invalid={!!fieldErrors.title}
                />
                <FormErrorIcon message={fieldErrors.title || ''} />
              </div>
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="announcement-content">
                Mensagem <span className="text-rose-500">*</span>
              </Label>
              <textarea
                id="announcement-content"
                placeholder="Escreva o conteudo do comunicado..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="flex-1 min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-priority">Prioridade</Label>
              <div
                role="radiogroup"
                className="grid gap-2 sm:grid-cols-3"
                data-testid="announcement-priority"
              >
                {PRIORITY_OPTIONS.map(option => {
                  const Icon = option.icon;
                  const isActive = priority === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setPriority(option.value)}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border p-3 text-left transition-colors',
                        'hover:border-violet-300',
                        isActive
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                          : 'border-input bg-transparent'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 mt-0.5 shrink-0',
                          isActive ? 'text-violet-600' : 'text-muted-foreground'
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {option.label}
                        </p>
                        <p className="text-[0.6875rem] text-muted-foreground mt-0.5">
                          {option.hint}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ),
      },
      // -----------------------------------------------------------------------
      // Step 2 — Audience
      // -----------------------------------------------------------------------
      {
        title: 'Para quem enviar?',
        description: 'Defina o publico-alvo do comunicado',
        icon: <Users className="h-16 w-16 text-violet-500/60" />,
        isValid: audienceHasAny,
        onBack: () => setCurrentStep(1),
        content: (
          <div className="flex flex-col h-full">
            <AudienceSelector
              value={audience}
              onChange={setAudience}
              broadcastToAll={broadcastToAll}
              onBroadcastToAllChange={setBroadcastToAll}
            />
          </div>
        ),
      },
      // -----------------------------------------------------------------------
      // Step 3 — Schedule
      // -----------------------------------------------------------------------
      {
        title: 'Quando publicar?',
        description: 'Publique imediatamente ou agende',
        icon: <CalendarClock className="h-16 w-16 text-violet-500/60" />,
        isValid:
          !isSubmitting &&
          (scheduleMode === 'now' ||
            (scheduleMode === 'later' && !!publishedAt)),
        onBack: () => setCurrentStep(2),
        content: (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Publicar agora</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Comunicado fica visivel imediatamente para a audiencia.
                </p>
              </div>
              <Switch
                checked={scheduleMode === 'now'}
                onCheckedChange={checked =>
                  setScheduleMode(checked ? 'now' : 'later')
                }
                aria-label="Publicar agora"
              />
            </div>

            {scheduleMode === 'later' && (
              <div className="space-y-2">
                <Label htmlFor="announcement-published-at">
                  Data e hora de publicacao{' '}
                  <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="announcement-published-at"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={e => setPublishedAt(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="announcement-expires">
                Data de expiracao (opcional)
              </Label>
              <Select
                value={expiresAt ? 'custom' : 'none'}
                onValueChange={value => {
                  if (value === 'none') {
                    setExpiresAt('');
                    return;
                  }
                  if (value !== 'custom') {
                    const days = parseInt(value, 10);
                    const next = new Date();
                    next.setDate(next.getDate() + days);
                    setExpiresAt(next.toISOString().slice(0, 10));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem expiracao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem expiracao</SelectItem>
                  <SelectItem value="7">Em 7 dias</SelectItem>
                  <SelectItem value="14">Em 14 dias</SelectItem>
                  <SelectItem value="30">Em 30 dias</SelectItem>
                  <SelectItem value="custom">Data personalizada</SelectItem>
                </SelectContent>
              </Select>
              {expiresAt && (
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                />
              )}
              <p className="text-xs text-muted-foreground">
                O comunicado sera ocultado automaticamente apos esta data.
              </p>
            </div>
          </div>
        ),
        footer: (
          <Button
            type="button"
            disabled={
              isSubmitting ||
              !title.trim() ||
              !content.trim() ||
              !audienceHasAny
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : scheduleMode === 'now' ? (
              'Publicar comunicado'
            ) : (
              'Agendar publicacao'
            )}
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      title,
      content,
      priority,
      audience,
      broadcastToAll,
      scheduleMode,
      publishedAt,
      expiresAt,
      isSubmitting,
      fieldErrors,
      audienceHasAny,
    ]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => !open && handleClose()}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
      heightClass="h-[600px]"
    />
  );
}
