'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { translateError } from '@/lib/error-messages';
import type {
  CreateWorkplaceRiskData,
  WorkplaceRisk,
  WorkplaceRiskCategory,
  WorkplaceRiskSeverity,
} from '@/types/hr';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AlertTriangle, Check, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkplaceRiskData) => void;
  isSubmitting: boolean;
  risk?: WorkplaceRisk | null;
}

const CATEGORY_OPTIONS: { value: WorkplaceRiskCategory; label: string }[] = [
  { value: 'FISICO', label: 'Físico' },
  { value: 'QUIMICO', label: 'Químico' },
  { value: 'BIOLOGICO', label: 'Biológico' },
  { value: 'ERGONOMICO', label: 'Ergonômico' },
  { value: 'ACIDENTE', label: 'Acidente' },
];

const SEVERITY_OPTIONS: { value: WorkplaceRiskSeverity; label: string }[] = [
  { value: 'BAIXO', label: 'Baixo' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'ALTO', label: 'Alto' },
  { value: 'CRITICO', label: 'Crítico' },
];

export function RiskModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  risk,
}: RiskModalProps) {
  const isEditing = !!risk;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<WorkplaceRiskCategory | ''>('');
  const [severity, setSeverity] = useState<WorkplaceRiskSeverity | ''>('');
  const [source, setSource] = useState('');
  const [affectedArea, setAffectedArea] = useState('');
  const [controlMeasures, setControlMeasures] = useState('');
  const [epiRequired, setEpiRequired] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (risk) {
        setName(risk.name);
        setCategory(risk.category);
        setSeverity(risk.severity);
        setSource(risk.source ?? '');
        setAffectedArea(risk.affectedArea ?? '');
        setControlMeasures(risk.controlMeasures ?? '');
        setEpiRequired(risk.epiRequired ?? '');
        setIsActive(risk.isActive);
      } else {
        setName('');
        setCategory('');
        setSeverity('');
        setSource('');
        setAffectedArea('');
        setControlMeasures('');
        setEpiRequired('');
        setIsActive(true);
        setFieldErrors({});
      }
    }
  }, [isOpen, risk]);

  const canSubmit = name.trim() && category && severity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const data: CreateWorkplaceRiskData = {
      name: name.trim(),
      category: category as WorkplaceRiskCategory,
      severity: severity as WorkplaceRiskSeverity,
      source: source.trim() || undefined,
      affectedArea: affectedArea.trim() || undefined,
      controlMeasures: controlMeasures.trim() || undefined,
      epiRequired: epiRequired.trim() || undefined,
      isActive,
    };

    try {
      await onSubmit(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('name already') || msg.includes('already exists') || msg.includes('nome')) {
        setFieldErrors(prev => ({ ...prev, name: translateError(msg) }));
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[700px] max-w-[700px] h-[520px] p-0 gap-0 overflow-hidden flex flex-row"
      >
        <VisuallyHidden>
          <DialogTitle>
            {isEditing ? 'Editar Risco' : 'Novo Risco'}
          </DialogTitle>
        </VisuallyHidden>

        {/* Left icon column */}
        <div className="w-[200px] shrink-0 bg-slate-50 dark:bg-white/5 flex items-center justify-center border-r border-border/50">
          <AlertTriangle
            className="h-16 w-16 text-amber-400"
            strokeWidth={1.2}
          />
        </div>

        {/* Right content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-semibold leading-none">
                {isEditing ? 'Editar Risco' : 'Novo Risco Ambiental'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditing
                  ? 'Atualize as informações do risco.'
                  : 'Registre um novo risco ambiental do trabalho.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            <div
              className="flex-1 overflow-y-auto px-6 py-2 space-y-4"
              onWheel={e => e.stopPropagation()}
            >
              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="risk-name" className="text-xs">
                  Nome do Risco <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="risk-name"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="Ex: Ruído contínuo acima de 85 dB"
                    className="h-9"
                    aria-invalid={!!fieldErrors.name}
                  />
                  <FormErrorIcon message={fieldErrors.name} />
                </div>
              </div>

              {/* Categoria + Severidade */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">
                    Categoria <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={category}
                    onValueChange={v => setCategory(v as WorkplaceRiskCategory)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">
                    Severidade <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={severity}
                    onValueChange={v => setSeverity(v as WorkplaceRiskSeverity)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fonte + Área */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="risk-source" className="text-xs">
                    Fonte Geradora
                  </Label>
                  <Input
                    id="risk-source"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="Ex: Máquina de corte"
                    className="h-9"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="risk-area" className="text-xs">
                    Área Afetada
                  </Label>
                  <Input
                    id="risk-area"
                    value={affectedArea}
                    onChange={e => setAffectedArea(e.target.value)}
                    placeholder="Ex: Setor de produção"
                    className="h-9"
                  />
                </div>
              </div>

              {/* Medidas de Controle */}
              <div className="space-y-1.5">
                <Label htmlFor="risk-controls" className="text-xs">
                  Medidas de Controle
                </Label>
                <Textarea
                  id="risk-controls"
                  value={controlMeasures}
                  onChange={e => setControlMeasures(e.target.value)}
                  placeholder="Descreva as medidas preventivas e corretivas..."
                  rows={2}
                />
              </div>

              {/* EPI */}
              <div className="space-y-1.5">
                <Label htmlFor="risk-epi" className="text-xs">
                  EPI Necessário
                </Label>
                <Input
                  id="risk-epi"
                  value={epiRequired}
                  onChange={e => setEpiRequired(e.target.value)}
                  placeholder="Ex: Protetor auricular, luvas"
                  className="h-9"
                />
              </div>

              {/* Ativo */}
              <div className="flex items-center gap-3">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label className="text-xs">Risco ativo</Label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-border/50">
              <Button type="submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isEditing ? 'Salvar Alterações' : 'Adicionar Risco'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
