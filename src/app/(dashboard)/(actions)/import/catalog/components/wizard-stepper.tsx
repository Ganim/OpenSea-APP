'use client';

// ============================================
// WIZARD STEPPER COMPONENT
// Navegação visual entre os passos do wizard
// ============================================

import { cn } from '@/lib/utils';
import {
  Upload,
  FileSpreadsheet,
  ArrowRightLeft,
  Eye,
  CheckCircle,
  Loader2,
  Check,
} from 'lucide-react';
import type { WizardStep } from '../hooks/use-catalog-import';

// ============================================
// TYPES
// ============================================

interface StepConfig {
  step: WizardStep;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  description: string;
}

interface WizardStepperProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  completedSteps?: WizardStep[];
  disabledSteps?: WizardStep[];
  className?: string;
}

// ============================================
// STEP CONFIGURATION
// ============================================

const STEPS: StepConfig[] = [
  {
    step: 1,
    label: 'Upload',
    shortLabel: 'Upload',
    icon: <Upload className="h-5 w-5" />,
    description: 'Selecione o arquivo Excel ou CSV',
  },
  {
    step: 2,
    label: 'Template',
    shortLabel: 'Template',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    description: 'Escolha o template de produto',
  },
  {
    step: 3,
    label: 'Mapeamento',
    shortLabel: 'Mapeamento',
    icon: <ArrowRightLeft className="h-5 w-5" />,
    description: 'Mapeie as colunas do arquivo',
  },
  {
    step: 4,
    label: 'Preview',
    shortLabel: 'Preview',
    icon: <Eye className="h-5 w-5" />,
    description: 'Visualize os dados agrupados',
  },
  {
    step: 5,
    label: 'Validar',
    shortLabel: 'Validar',
    icon: <CheckCircle className="h-5 w-5" />,
    description: 'Valide os dados antes de importar',
  },
  {
    step: 6,
    label: 'Importar',
    shortLabel: 'Importar',
    icon: <Loader2 className="h-5 w-5" />,
    description: 'Execute a importação',
  },
];

// ============================================
// COMPONENT
// ============================================

export function WizardStepper({
  currentStep,
  onStepClick,
  completedSteps = [],
  disabledSteps = [],
  className,
}: WizardStepperProps) {
  const completedSet = new Set(completedSteps);
  const disabledSet = new Set(disabledSteps);

  const getStepStatus = (
    step: WizardStep
  ): 'completed' | 'current' | 'upcoming' | 'disabled' => {
    if (disabledSet.has(step)) return 'disabled';
    if (completedSet.has(step)) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (step: WizardStep) => {
    if (onStepClick && !disabledSet.has(step) && step <= currentStep) {
      onStepClick(step);
    }
  };

  return (
    <nav className={cn('w-full', className)} aria-label="Progresso do wizard">
      {/* Mobile: Compact view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium text-foreground">
            Passo {currentStep} de {STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {STEPS[currentStep - 1]?.label}
          </span>
        </div>
        <div className="mt-2 flex gap-1">
          {STEPS.map(stepConfig => {
            const status = getStepStatus(stepConfig.step);
            return (
              <div
                key={stepConfig.step}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  status === 'completed' && 'bg-primary',
                  status === 'current' && 'bg-primary',
                  status === 'upcoming' && 'bg-muted',
                  status === 'disabled' && 'bg-muted/50'
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop: Full stepper */}
      <ol className="hidden md:flex md:items-center md:gap-2">
        {STEPS.map((stepConfig, index) => {
          const status = getStepStatus(stepConfig.step);
          const isLast = index === STEPS.length - 1;
          const isClickable =
            !disabledSet.has(stepConfig.step) && stepConfig.step <= currentStep;

          return (
            <li key={stepConfig.step} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => handleStepClick(stepConfig.step)}
                disabled={!isClickable}
                className={cn(
                  'group flex flex-col items-center gap-2 w-full py-2 px-1 rounded-lg transition-colors',
                  isClickable && 'cursor-pointer hover:bg-muted/50',
                  !isClickable && 'cursor-default'
                )}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                {/* Step indicator */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    status === 'completed' &&
                      'border-primary bg-primary text-primary-foreground',
                    status === 'current' &&
                      'border-primary bg-background text-primary ring-2 ring-primary/20',
                    status === 'upcoming' &&
                      'border-muted-foreground/30 bg-background text-muted-foreground',
                    status === 'disabled' &&
                      'border-muted bg-muted/30 text-muted-foreground/50'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    stepConfig.icon
                  )}
                </div>

                {/* Step label */}
                <div className="text-center">
                  <span
                    className={cn(
                      'block text-xs font-medium transition-colors',
                      status === 'completed' && 'text-primary',
                      status === 'current' && 'text-foreground',
                      status === 'upcoming' && 'text-muted-foreground',
                      status === 'disabled' && 'text-muted-foreground/50'
                    )}
                  >
                    {stepConfig.shortLabel}
                  </span>
                </div>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-1 transition-colors',
                    completedSet.has(stepConfig.step)
                      ? 'bg-primary'
                      : 'bg-muted'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ============================================
// STEP INFO COMPONENT
// Informações detalhadas do passo atual
// ============================================

interface StepInfoProps {
  step: WizardStep;
  className?: string;
}

export function StepInfo({ step, className }: StepInfoProps) {
  const stepConfig = STEPS.find(s => s.step === step);
  if (!stepConfig) return null;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {stepConfig.icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Passo {step}: {stepConfig.label}
        </h2>
        <p className="text-sm text-muted-foreground">
          {stepConfig.description}
        </p>
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export { STEPS };
export type { StepConfig, WizardStepperProps };
