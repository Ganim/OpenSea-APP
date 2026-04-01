'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  NavigationWizardDialog,
  type NavigationSection,
} from '@/components/ui/navigation-wizard-dialog';
import type {
  SurveyQuestion,
  SurveyAnswer,
  SubmitSurveyResponseData,
} from '@/types/hr';
import {
  CheckCircle2,
  Hash,
  HelpCircle,
  Loader2,
  MessageSquare,
  Star,
  ToggleLeft,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { QUESTION_TYPE_LABELS } from '../constants';

interface SubmitResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: SubmitSurveyResponseData) => Promise<void>;
  questions: SurveyQuestion[];
  surveyTitle: string;
}

function getQuestionIcon(type: string) {
  switch (type) {
    case 'RATING_1_5':
    case 'RATING_1_10':
      return <Star className="h-4 w-4" />;
    case 'YES_NO':
      return <ToggleLeft className="h-4 w-4" />;
    case 'TEXT':
      return <MessageSquare className="h-4 w-4" />;
    case 'MULTIPLE_CHOICE':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'NPS':
      return <Hash className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
}

export function SubmitResponseModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
  questions,
  surveyTitle,
}: SubmitResponseModalProps) {
  const [activeSection, setActiveSection] = useState(questions[0]?.id ?? '');
  const [answers, setAnswers] = useState<Record<string, SurveyAnswer>>({});

  const resetForm = () => {
    setActiveSection(questions[0]?.id ?? '');
    setAnswers({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const updateAnswer = useCallback(
    (questionId: string, partial: Partial<SurveyAnswer>) => {
      setAnswers(prev => {
        const existing = prev[questionId] ?? {
          questionId,
          ratingValue: null,
          textValue: null,
          selectedOptions: null,
        };
        return {
          ...prev,
          [questionId]: {
            ...existing,
            ...partial,
          },
        };
      });
    },
    []
  );

  const sections: NavigationSection[] = useMemo(
    () =>
      questions.map((q, i) => ({
        id: q.id,
        label: `Pergunta ${i + 1}`,
        icon: getQuestionIcon(q.type),
        description:
          q.text.length > 40 ? q.text.substring(0, 40) + '...' : q.text,
      })),
    [questions]
  );

  const sectionErrors = useMemo(() => {
    const errors: Record<string, boolean> = {};
    for (const q of questions) {
      if (q.isRequired && !answers[q.id]) {
        errors[q.id] = true;
      }
    }
    return errors;
  }, [questions, answers]);

  const allRequiredAnswered = useMemo(
    () =>
      questions
        .filter(q => q.isRequired)
        .every(q => {
          const a = answers[q.id];
          if (!a) return false;
          if (
            q.type === 'RATING_1_5' ||
            q.type === 'RATING_1_10' ||
            q.type === 'NPS'
          ) {
            return a.ratingValue !== null && a.ratingValue !== undefined;
          }
          if (q.type === 'YES_NO') {
            return a.ratingValue !== null && a.ratingValue !== undefined;
          }
          if (q.type === 'TEXT') {
            return a.textValue !== null && a.textValue?.trim() !== '';
          }
          if (q.type === 'MULTIPLE_CHOICE') {
            return a.selectedOptions !== null && a.selectedOptions.length > 0;
          }
          return true;
        }),
    [questions, answers]
  );

  const handleSubmit = async () => {
    const answersArray: SurveyAnswer[] = Object.values(answers);
    await onSubmit({ answers: answersArray });
    handleClose();
  };

  const activeQuestion = questions.find(q => q.id === activeSection);

  return (
    <NavigationWizardDialog
      open={isOpen}
      onOpenChange={val => {
        if (!val) handleClose();
      }}
      title="Responder Pesquisa"
      subtitle={surveyTitle}
      sections={sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      variant="compact"
      sectionErrors={sectionErrors}
      isPending={isSubmitting}
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!allRequiredAnswered || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Respostas'
            )}
          </Button>
        </>
      }
    >
      {activeQuestion && (
        <QuestionField
          question={activeQuestion}
          answer={answers[activeQuestion.id]}
          onUpdate={partial => updateAnswer(activeQuestion.id, partial)}
        />
      )}
    </NavigationWizardDialog>
  );
}

// ============================================================================
// QUESTION FIELD COMPONENT
// ============================================================================

function QuestionField({
  question,
  answer,
  onUpdate,
}: {
  question: SurveyQuestion;
  answer: SurveyAnswer | undefined;
  onUpdate: (partial: Partial<SurveyAnswer>) => void;
}) {
  const ratingValue = answer?.ratingValue ?? null;
  const textValue = answer?.textValue ?? '';
  const selectedOptions = answer?.selectedOptions ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium">
          {question.text}
          {question.isRequired && <span className="text-rose-500 ml-1">*</span>}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {QUESTION_TYPE_LABELS[question.type]}
        </p>
      </div>

      {/* RATING 1-5 */}
      {question.type === 'RATING_1_5' && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(value => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdate({ ratingValue: value })}
              className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 text-lg font-semibold transition-all ${
                ratingValue === value
                  ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/8 dark:text-violet-300'
                  : 'border-border hover:border-violet-300 hover:bg-accent'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {/* RATING 1-10 */}
      {question.type === 'RATING_1_10' && (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdate({ ratingValue: value })}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all ${
                ratingValue === value
                  ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/8 dark:text-violet-300'
                  : 'border-border hover:border-violet-300 hover:bg-accent'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {/* YES_NO */}
      {question.type === 'YES_NO' && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onUpdate({ ratingValue: 1 })}
            className={`flex-1 rounded-lg border-2 py-3 text-center font-medium transition-all ${
              ratingValue === 1
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300'
                : 'border-border hover:border-emerald-300 hover:bg-accent'
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ ratingValue: 0 })}
            className={`flex-1 rounded-lg border-2 py-3 text-center font-medium transition-all ${
              ratingValue === 0
                ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300'
                : 'border-border hover:border-rose-300 hover:bg-accent'
            }`}
          >
            Não
          </button>
        </div>
      )}

      {/* TEXT */}
      {question.type === 'TEXT' && (
        <Textarea
          placeholder="Digite sua resposta..."
          value={textValue}
          onChange={e => onUpdate({ textValue: e.target.value })}
          rows={4}
        />
      )}

      {/* MULTIPLE_CHOICE */}
      {question.type === 'MULTIPLE_CHOICE' && question.options && (
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const isChecked = selectedOptions.includes(option);
            return (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent"
                onClick={() => {
                  const newSelected = isChecked
                    ? selectedOptions.filter(o => o !== option)
                    : [...selectedOptions, option];
                  onUpdate({ selectedOptions: newSelected });
                }}
              >
                <Checkbox checked={isChecked} />
                <span className="text-sm">{option}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* NPS 0-10 */}
      {question.type === 'NPS' && (
        <div>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => {
              let colorClass = 'border-border hover:bg-accent';
              if (ratingValue === value) {
                if (value <= 6) {
                  colorClass =
                    'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300';
                } else if (value <= 8) {
                  colorClass =
                    'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300';
                } else {
                  colorClass =
                    'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300';
                }
              }
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onUpdate({ ratingValue: value })}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all ${colorClass}`}
                >
                  {value}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Nada provável</span>
            <span>Extremamente provável</span>
          </div>
        </div>
      )}
    </div>
  );
}
