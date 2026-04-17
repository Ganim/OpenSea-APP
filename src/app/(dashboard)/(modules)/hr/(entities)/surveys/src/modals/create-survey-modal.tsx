'use client';

/**
 * CreateSurveyModal
 *
 * Wizard de 4 passos para criar uma pesquisa, inspirado em 15Five (Pulse) e
 * Lattice (Engagement):
 *   1. Tipo + título + descrição (radio cards de tipo)
 *   2. Perguntas — builder dinâmico com templates pré-prontos por tipo
 *   3. Audiência — usa AudienceSelector (apenas indicativo, backend não
 *      persiste audiência ainda)
 *   4. Recorrência + agenda (publishedAt / closesAt)
 *
 * Após criar a pesquisa, dispara as chamadas para adicionar cada pergunta
 * em ordem. A audiência é apenas client-side por enquanto.
 */

import {
  AudienceSelector,
  type AudienceSelection,
} from '@/components/hr/audience-selector';
import { Badge } from '@/components/ui/badge';
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
import { surveysService } from '@/services/hr/surveys.service';
import type {
  AddSurveyQuestionData,
  CreateSurveyData,
  SurveyQuestionCategory,
  SurveyQuestionType,
  SurveyType,
} from '@/types/hr';
import {
  CalendarClock,
  ClipboardList,
  GripVertical,
  HelpCircle,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  QUESTION_CATEGORY_OPTIONS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_OPTIONS,
  SURVEY_TYPE_COLORS,
  SURVEY_TYPE_LABELS,
} from '../constants';

// ============================================================================
// CONSTANTS
// ============================================================================

type Recurrence = 'ONCE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';

const RECURRENCE_OPTIONS: {
  value: Recurrence;
  label: string;
  subtitle: string;
}[] = [
  {
    value: 'ONCE',
    label: 'Único',
    subtitle: 'Aplicação única, sem repetição',
  },
  {
    value: 'WEEKLY',
    label: 'Semanal',
    subtitle: 'Ideal para Pulse Surveys curtos',
  },
  {
    value: 'BIWEEKLY',
    label: 'Quinzenal',
    subtitle: 'A cada 2 semanas',
  },
  {
    value: 'MONTHLY',
    label: 'Mensal',
    subtitle: 'Recomendado para eNPS',
  },
  {
    value: 'QUARTERLY',
    label: 'Trimestral',
    subtitle: 'Pesquisas longas de engajamento',
  },
];

const SURVEY_TYPE_DESCRIPTIONS: Record<SurveyType, string> = {
  PULSE:
    'Pesquisa curta (1-3 perguntas) recorrente para medir o pulso da equipe.',
  ENGAGEMENT:
    'Pesquisa profunda de engajamento com várias dimensões (cultura, liderança, crescimento).',
  SATISFACTION: 'Pesquisa de satisfação geral com a empresa ou um processo.',
  EXIT: 'Pesquisa de desligamento aplicada quando um colaborador deixa a empresa.',
  CUSTOM: 'Pesquisa personalizada para necessidades específicas.',
};

// Templates de perguntas prontas por tipo de pesquisa
interface QuestionTemplate {
  text: string;
  type: SurveyQuestionType;
  category: SurveyQuestionCategory;
  options?: string[];
  isRequired?: boolean;
}

const SURVEY_QUESTION_TEMPLATES: Record<SurveyType, QuestionTemplate[]> = {
  PULSE: [
    {
      text: 'Como você está se sentindo no trabalho esta semana?',
      type: 'RATING_1_5',
      category: 'ENGAGEMENT',
    },
    {
      text: 'Você se sente apoiado(a) pela sua liderança?',
      type: 'RATING_1_5',
      category: 'LEADERSHIP',
    },
    {
      text: 'Há algo que poderíamos melhorar nesta semana?',
      type: 'TEXT',
      category: 'CUSTOM',
      isRequired: false,
    },
  ],
  ENGAGEMENT: [
    {
      text: 'Eu recomendaria minha empresa como um ótimo lugar para trabalhar.',
      type: 'RATING_1_5',
      category: 'ENGAGEMENT',
    },
    {
      text: 'Tenho clareza do que se espera de mim no meu trabalho.',
      type: 'RATING_1_5',
      category: 'CULTURE',
    },
    {
      text: 'Recebo feedback útil e construtivo do meu líder.',
      type: 'RATING_1_5',
      category: 'LEADERSHIP',
    },
    {
      text: 'Tenho oportunidades reais de crescimento aqui.',
      type: 'RATING_1_5',
      category: 'GROWTH',
    },
    {
      text: 'Consigo equilibrar bem meu trabalho e minha vida pessoal.',
      type: 'RATING_1_5',
      category: 'WORK_LIFE',
    },
  ],
  SATISFACTION: [
    {
      text: 'No geral, qual o seu nível de satisfação?',
      type: 'RATING_1_10',
      category: 'CUSTOM',
    },
    {
      text: 'O que mais funciona bem hoje?',
      type: 'TEXT',
      category: 'CUSTOM',
      isRequired: false,
    },
  ],
  EXIT: [
    {
      text: 'Qual foi o principal motivo para sua saída?',
      type: 'MULTIPLE_CHOICE',
      category: 'CUSTOM',
      options: [
        'Remuneração',
        'Liderança',
        'Falta de crescimento',
        'Cultura',
        'Mudança de carreira',
        'Outro',
      ],
    },
    {
      text: 'O que poderíamos ter feito diferente?',
      type: 'TEXT',
      category: 'CUSTOM',
    },
    {
      text: 'Você recomendaria a empresa para um amigo?',
      type: 'NPS',
      category: 'ENGAGEMENT',
    },
  ],
  CUSTOM: [],
};

const ENPS_TEMPLATE: QuestionTemplate = {
  text: 'De 0 a 10, qual a probabilidade de você recomendar a empresa para um amigo?',
  type: 'NPS',
  category: 'ENGAGEMENT',
};

// ============================================================================
// LOCAL STATE TYPES
// ============================================================================

interface DraftQuestion {
  id: string;
  text: string;
  type: SurveyQuestionType | '';
  category: SurveyQuestionCategory | '';
  options: string[];
  isRequired: boolean;
}

const EMPTY_AUDIENCE: AudienceSelection = {
  departments: [],
  teams: [],
  roles: [],
  employees: [],
};

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CreateSurveyData) => Promise<{ survey: { id: string } }>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateSurveyModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: CreateSurveyModalProps) {
  const [step, setStep] = useState(1);

  // Step 1
  const [type, setType] = useState<SurveyType | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Step 2
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);

  // Step 3
  const [broadcastToAll, setBroadcastToAll] = useState(true);
  const [audience, setAudience] = useState<AudienceSelection>(EMPTY_AUDIENCE);

  // Step 4
  const [recurrence, setRecurrence] = useState<Recurrence>('ONCE');
  const [publishedAt, setPublishedAt] = useState('');
  const [closesAt, setClosesAt] = useState('');

  const [isSubmittingQuestions, setIsSubmittingQuestions] = useState(false);

  const resetForm = () => {
    setStep(1);
    setType('');
    setTitle('');
    setDescription('');
    setIsAnonymous(false);
    setQuestions([]);
    setBroadcastToAll(true);
    setAudience(EMPTY_AUDIENCE);
    setRecurrence('ONCE');
    setPublishedAt('');
    setClosesAt('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const makeDraftQuestion = (template?: QuestionTemplate): DraftQuestion => ({
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: template?.text ?? '',
    type: template?.type ?? '',
    category: template?.category ?? '',
    options: template?.options ?? [],
    isRequired: template?.isRequired ?? true,
  });

  const updateQuestion = (id: string, partial: Partial<DraftQuestion>) => {
    setQuestions(previous =>
      previous.map(question =>
        question.id === id ? { ...question, ...partial } : question
      )
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(previous => previous.filter(question => question.id !== id));
  };

  const addQuestion = () => {
    setQuestions(previous => [...previous, makeDraftQuestion()]);
  };

  const applyTemplates = () => {
    if (!type) return;
    const templates = SURVEY_QUESTION_TEMPLATES[type] ?? [];
    setQuestions(templates.map(template => makeDraftQuestion(template)));
  };

  const applyEnpsTemplate = () => {
    setQuestions([makeDraftQuestion(ENPS_TEMPLATE)]);
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const step1Valid = title.trim().length > 0 && type.length > 0;
  const step2Valid =
    questions.length > 0 &&
    questions.every(question => {
      if (!question.text.trim() || !question.type) return false;
      if (question.type === 'MULTIPLE_CHOICE') {
        return question.options.filter(opt => opt.trim()).length >= 2;
      }
      return true;
    });
  const step3Valid =
    broadcastToAll ||
    audience.departments.length +
      audience.teams.length +
      audience.roles.length +
      audience.employees.length >
      0;

  const isCustomDateValid = useMemo(() => {
    if (!publishedAt || !closesAt) return false;
    return new Date(closesAt).getTime() > new Date(publishedAt).getTime();
  }, [publishedAt, closesAt]);

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const handleSubmit = async () => {
    if (!type) return;

    const payload: CreateSurveyData = {
      title: title.trim(),
      type,
      isAnonymous,
    };

    if (description.trim()) payload.description = description.trim();
    if (publishedAt) payload.startDate = new Date(publishedAt).toISOString();
    if (closesAt) payload.endDate = new Date(closesAt).toISOString();

    let surveyId: string | undefined;
    try {
      const result = await onSubmit(payload);
      surveyId = result?.survey?.id;
    } catch {
      // outer mutation handles toast
      return;
    }

    if (surveyId && questions.length > 0) {
      setIsSubmittingQuestions(true);
      try {
        for (let index = 0; index < questions.length; index += 1) {
          const question = questions[index];
          const data: AddSurveyQuestionData = {
            text: question.text.trim(),
            type: question.type as SurveyQuestionType,
            order: index + 1,
            isRequired: question.isRequired,
          };
          if (question.category) {
            data.category = question.category as SurveyQuestionCategory;
          }
          if (question.type === 'MULTIPLE_CHOICE') {
            data.options = question.options.filter(opt => opt.trim());
          }
          await surveysService.addQuestion(surveyId, data);
        }
        toast.success(
          `${questions.length} pergunta${questions.length > 1 ? 's' : ''} adicionada${questions.length > 1 ? 's' : ''} à pesquisa`
        );
      } catch {
        toast.error('Pesquisa criada, mas falhou ao adicionar as perguntas');
      } finally {
        setIsSubmittingQuestions(false);
      }
    }

    handleClose();
  };

  // ============================================================================
  // STEPS
  // ============================================================================

  const steps: WizardStep[] = [
    {
      title: 'Tipo e Identificação',
      description: 'Escolha o tipo, dê um título e descreva o objetivo',
      icon: (
        <ClipboardList className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step1Valid,
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label>Tipo da pesquisa *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(SURVEY_TYPE_LABELS) as SurveyType[]).map(
                surveyType => {
                  const colors = SURVEY_TYPE_COLORS[surveyType];
                  const isSelected = type === surveyType;
                  return (
                    <button
                      key={surveyType}
                      type="button"
                      onClick={() => setType(surveyType)}
                      className={`text-left rounded-xl border-2 p-3 transition-all ${
                        isSelected
                          ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-500/8'
                          : 'border-border hover:border-violet-300 hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`h-2.5 w-2.5 rounded-full bg-linear-to-br ${colors.gradient}`}
                        />
                        <span className="text-sm font-semibold">
                          {SURVEY_TYPE_LABELS[surveyType]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {SURVEY_TYPE_DESCRIPTIONS[surveyType]}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Pulse semanal — Time de Engenharia"
              value={title}
              onChange={event => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Explique brevemente o objetivo desta pesquisa..."
              value={description}
              onChange={event => setDescription(event.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Switch
              id="isAnonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <div>
              <Label htmlFor="isAnonymous" className="cursor-pointer">
                Pesquisa anônima
              </Label>
              <p className="text-xs text-muted-foreground">
                As respostas não serão vinculadas aos colaboradores
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Perguntas',
      description: 'Adicione perguntas ou comece com um template',
      icon: (
        <HelpCircle className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step2Valid,
      onBack: () => setStep(1),
      content: (
        <div className="space-y-4 p-1">
          {/* Template actions */}
          <div className="flex flex-wrap gap-2">
            {type && SURVEY_QUESTION_TEMPLATES[type]?.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-2.5"
                onClick={applyTemplates}
              >
                <Sparkles className="h-4 w-4 mr-1.5 text-violet-500" />
                Usar template de {SURVEY_TYPE_LABELS[type]}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-2.5"
              onClick={applyEnpsTemplate}
            >
              <Sparkles className="h-4 w-4 mr-1.5 text-emerald-500" />
              Template eNPS (1 pergunta)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-2.5"
              onClick={addQuestion}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Adicionar pergunta vazia
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">
                Nenhuma pergunta adicionada ainda
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use um template ou adicione manualmente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <DraftQuestionEditor
                  key={question.id}
                  index={index}
                  question={question}
                  onUpdate={partial => updateQuestion(question.id, partial)}
                  onRemove={() => removeQuestion(question.id)}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Audiência',
      description: 'Escolha quem vai receber esta pesquisa',
      icon: (
        <Users className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: step3Valid,
      onBack: () => setStep(2),
      content: (
        <div className="space-y-4 p-1">
          <p className="text-xs text-muted-foreground">
            A audiência informa quem deve responder. A entrega efetiva via
            notificação será feita em uma próxima atualização do backend.
          </p>
          <AudienceSelector
            value={audience}
            onChange={setAudience}
            broadcastToAll={broadcastToAll}
            onBroadcastToAllChange={setBroadcastToAll}
            testId="surveys-audience-selector"
          />
        </div>
      ),
    },
    {
      title: 'Recorrência e Agenda',
      description: 'Defina periodicidade e janela de respostas',
      icon: (
        <CalendarClock className="h-16 w-16 text-violet-500 dark:text-violet-400" />
      ),
      isValid: isCustomDateValid,
      onBack: () => setStep(3),
      content: (
        <div className="space-y-4 p-1">
          <div className="space-y-2">
            <Label>Recorrência</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RECURRENCE_OPTIONS.map(option => {
                const isSelected = recurrence === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRecurrence(option.value)}
                    className={`text-left rounded-lg border-2 p-3 transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-500/8'
                        : 'border-border hover:border-violet-300 hover:bg-accent/50'
                    }`}
                  >
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
            {recurrence !== 'ONCE' && (
              <p className="text-xs text-muted-foreground">
                A recorrência será aplicada na próxima atualização do backend.
                Por enquanto, a pesquisa é criada como aplicação única.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="publishedAt">Início *</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                value={publishedAt}
                onChange={event => setPublishedAt(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closesAt">Encerramento *</Label>
              <Input
                id="closesAt"
                type="datetime-local"
                value={closesAt}
                onChange={event => setClosesAt(event.target.value)}
              />
            </div>
          </div>
          {publishedAt && closesAt && !isCustomDateValid && (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              A data de encerramento deve ser depois do início.
            </p>
          )}

          {/* Summary */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Resumo
            </p>
            <div className="flex flex-wrap gap-2">
              {type && (
                <Badge
                  variant="outline"
                  className={`${SURVEY_TYPE_COLORS[type].bg} ${SURVEY_TYPE_COLORS[type].text} border-0`}
                >
                  {SURVEY_TYPE_LABELS[type]}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="bg-slate-100 dark:bg-slate-500/8 border-0"
              >
                {questions.length}{' '}
                {questions.length === 1 ? 'pergunta' : 'perguntas'}
              </Badge>
              {isAnonymous && (
                <Badge
                  variant="outline"
                  className="bg-sky-50 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300 border-0"
                >
                  Anônima
                </Badge>
              )}
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300 border-0"
              >
                {RECURRENCE_OPTIONS.find(opt => opt.value === recurrence)
                  ?.label ?? 'Único'}
              </Badge>
            </div>
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2 p-4 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={() => setStep(3)}
            disabled={isSubmitting || isSubmittingQuestions}
          >
            Voltar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !step1Valid ||
              !step2Valid ||
              !step3Valid ||
              !isCustomDateValid ||
              isSubmitting ||
              isSubmittingQuestions
            }
          >
            {isSubmitting || isSubmittingQuestions ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSubmittingQuestions
                  ? 'Adicionando perguntas...'
                  : 'Criando...'}
              </>
            ) : (
              'Criar Pesquisa'
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      onClose={handleClose}
      heightClass="h-[640px]"
    />
  );
}

// ============================================================================
// QUESTION EDITOR (single draft row)
// ============================================================================

function DraftQuestionEditor({
  index,
  question,
  onUpdate,
  onRemove,
}: {
  index: number;
  question: DraftQuestion;
  onUpdate: (partial: Partial<DraftQuestion>) => void;
  onRemove: () => void;
}) {
  const isMultipleChoice = question.type === 'MULTIPLE_CHOICE';
  const visibleOptions = isMultipleChoice
    ? question.options.length === 0
      ? ['']
      : question.options
    : [];

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-800/40 p-3">
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 mt-2 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              #{index + 1}
            </span>
            <Badge variant="outline" className="text-xs">
              {question.type
                ? QUESTION_TYPE_LABELS[question.type as SurveyQuestionType]
                : 'Sem tipo'}
            </Badge>
          </div>

          <Textarea
            placeholder="Texto da pergunta..."
            value={question.text}
            onChange={event => onUpdate({ text: event.target.value })}
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select
              value={question.type || ''}
              onValueChange={value =>
                onUpdate({
                  type: value as SurveyQuestionType,
                  options: value === 'MULTIPLE_CHOICE' ? question.options : [],
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tipo de resposta" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={question.category || ''}
              onValueChange={value =>
                onUpdate({ category: value as SurveyQuestionCategory })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_CATEGORY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isMultipleChoice && (
            <div className="space-y-2">
              <Label className="text-xs">Opções de resposta</Label>
              {visibleOptions.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Input
                    value={option}
                    placeholder={`Opção ${optionIndex + 1}`}
                    onChange={event => {
                      const next = [...visibleOptions];
                      next[optionIndex] = event.target.value;
                      onUpdate({ options: next });
                    }}
                  />
                  {visibleOptions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() =>
                        onUpdate({
                          options: visibleOptions.filter(
                            (_, i) => i !== optionIndex
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => onUpdate({ options: [...visibleOptions, ''] })}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Adicionar opção
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch
              checked={question.isRequired}
              onCheckedChange={value => onUpdate({ isRequired: value })}
            />
            <span className="text-xs text-muted-foreground">
              Resposta obrigatória
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/8"
          onClick={onRemove}
          aria-label="Remover pergunta"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
