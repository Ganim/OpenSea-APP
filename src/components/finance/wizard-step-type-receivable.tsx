'use client';

import type { ReceivableSubType } from '@/types/finance';
import { RECEIVABLE_SUBTYPE_LABELS } from '@/types/finance';
import { Briefcase, Home, MoreHorizontal, ShoppingCart } from 'lucide-react';
import type {
  ReceivableWizardData,
  WizardStep,
} from './receivable-wizard-modal';

// ============================================================================
// CONSTANTS
// ============================================================================

const SUB_TYPE_CONFIG: {
  type: ReceivableSubType;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    type: 'VENDA',
    icon: ShoppingCart,
    description: 'Receita de venda de produto ou mercadoria',
  },
  {
    type: 'SERVICO',
    icon: Briefcase,
    description: 'Receita de prestacao de servico',
  },
  {
    type: 'ALUGUEL',
    icon: Home,
    description: 'Receita de aluguel de imovel ou equipamento',
  },
  {
    type: 'OUTROS',
    icon: MoreHorizontal,
    description: 'Outros tipos de receita',
  },
];

// ============================================================================
// PROPS
// ============================================================================

interface WizardStepTypeReceivableProps {
  wizardData: ReceivableWizardData;
  updateWizardData: (updates: Partial<ReceivableWizardData>) => void;
  goToStep: (step: WizardStep) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WizardStepTypeReceivable({
  wizardData,
  updateWizardData,
  goToStep,
}: WizardStepTypeReceivableProps) {
  const handleSelect = (subType: ReceivableSubType) => {
    updateWizardData({ subType });
    goToStep(2);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Selecione o tipo de conta a receber:
      </p>

      <div className="grid grid-cols-2 gap-3">
        {SUB_TYPE_CONFIG.map(({ type, icon: Icon, description }) => {
          const isSelected = wizardData.subType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => handleSelect(type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:shadow-sm ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Icon
                className={`h-8 w-8 ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span className="text-sm font-medium">
                {RECEIVABLE_SUBTYPE_LABELS[type]}
              </span>
              <span className="text-xs text-muted-foreground text-center leading-tight">
                {description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
