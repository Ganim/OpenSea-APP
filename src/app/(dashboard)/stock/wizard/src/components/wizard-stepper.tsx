'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { WizardStep } from '../hooks/use-wizard';

interface StepConfig {
  key: WizardStep;
  label: string;
  description: string;
}

const STEP_CONFIGS: StepConfig[] = [
  {
    key: 'template',
    label: 'Template',
    description: 'Selecione o tipo de produto',
  },
  {
    key: 'product',
    label: 'Produto',
    description: 'Dados do produto',
  },
  {
    key: 'variants',
    label: 'Variantes',
    description: 'Cores, tamanhos, etc.',
  },
  {
    key: 'stock',
    label: 'Estoque',
    description: 'Entrada inicial',
  },
];

interface WizardStepperProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  completedSteps?: WizardStep[];
  className?: string;
}

export function WizardStepper({
  currentStep,
  onStepClick,
  completedSteps = [],
  className,
}: WizardStepperProps) {
  const currentIndex = STEP_CONFIGS.findIndex(s => s.key === currentStep);

  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center">
        {STEP_CONFIGS.map((step, stepIndex) => {
          const isCurrent = step.key === currentStep;
          const isCompleted =
            completedSteps.includes(step.key) || stepIndex < currentIndex;
          const isClickable = isCompleted || stepIndex <= currentIndex;

          return (
            <li
              key={step.key}
              className={cn(
                'relative flex-1',
                stepIndex !== STEP_CONFIGS.length - 1 && 'pr-8 sm:pr-12'
              )}
            >
              {/* Connector line */}
              {stepIndex !== STEP_CONFIGS.length - 1 && (
                <div
                  className="absolute top-4 left-7 -right-5 sm:left-8 sm:-right-8 h-0.5"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      'h-full',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                </div>
              )}

              <button
                type="button"
                className={cn(
                  'relative flex items-center group',
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                )}
                onClick={() => isClickable && onStepClick?.(step.key)}
                disabled={!isClickable}
              >
                {/* Step circle */}
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    isCurrent &&
                      'border-primary bg-primary text-primary-foreground',
                    isCompleted &&
                      !isCurrent &&
                      'border-primary bg-primary text-primary-foreground',
                    !isCurrent &&
                      !isCompleted &&
                      'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepIndex + 1
                  )}
                </span>

                {/* Step label */}
                <span className="ml-3 hidden sm:block">
                  <span
                    className={cn(
                      'text-sm font-medium block',
                      isCurrent && 'text-primary',
                      isCompleted && !isCurrent && 'text-primary',
                      !isCurrent && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {step.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ============================================
// WIZARD NAVIGATION BUTTONS
// ============================================

interface WizardNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  onFinish?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
  canProceed?: boolean;
  className?: string;
}

export function WizardNavigation({
  onPrev,
  onNext,
  onFinish,
  isFirstStep,
  isLastStep,
  isLoading,
  canProceed = true,
  className,
}: WizardNavigationProps) {
  return (
    <div className={cn('flex justify-between pt-6 border-t', className)}>
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep || isLoading}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-md border transition-colors',
          isFirstStep ? 'invisible' : 'hover:bg-muted'
        )}
      >
        Voltar
      </button>

      {isLastStep ? (
        <button
          type="button"
          onClick={onFinish}
          disabled={!canProceed || isLoading}
          className={cn(
            'px-6 py-2 text-sm font-medium rounded-md transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            (!canProceed || isLoading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? 'Salvando...' : 'Finalizar'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={cn(
            'px-6 py-2 text-sm font-medium rounded-md transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            (!canProceed || isLoading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          Próximo
        </button>
      )}
    </div>
  );
}
