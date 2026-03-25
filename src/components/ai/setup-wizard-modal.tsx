'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Building2,
  Users,
  MapPin,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  aiSetupWizardService,
  type SetupWizardResultItem,
  type SetupWizardResponse,
} from '@/services/ai/setup-wizard-service';

interface SetupWizardModalProps {
  open: boolean;
  onClose: () => void;
}

const INDUSTRIES = [
  { value: 'varejo', label: 'Varejo' },
  { value: 'atacado', label: 'Atacado' },
  { value: 'servicos', label: 'Servicos' },
  { value: 'industria', label: 'Industria' },
  { value: 'alimentacao', label: 'Alimentacao' },
  { value: 'saude', label: 'Saude' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'educacao', label: 'Educacao' },
  { value: 'construcao', label: 'Construcao Civil' },
  { value: 'outro', label: 'Outro' },
];

const PROGRESS_STEPS = [
  'Analisando descricao do negocio...',
  'Configurando modulos e categorias...',
  'Criando estrutura de produtos...',
  'Definindo configuracoes de estoque...',
  'Configurando financeiro...',
  'Finalizando setup...',
];

export function SetupWizardModal({ open, onClose }: SetupWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [businessDescription, setBusinessDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [locationCount, setLocationCount] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [results, setResults] = useState<SetupWizardResponse | null>(null);

  const setupMutation = useMutation({
    mutationFn: aiSetupWizardService.run,
    onSuccess: data => {
      setResults(data);
      setStep(3);
    },
    onError: () => {
      toast.error('Erro ao executar o assistente de configuracao.');
      setStep(1);
    },
  });

  const handleStart = useCallback(() => {
    if (!businessDescription.trim() || !industry) {
      toast.error('Preencha a descricao do negocio e selecione o setor.');
      return;
    }

    setStep(2);
    setProgressStep(0);

    // Simulate progress steps
    const interval = setInterval(() => {
      setProgressStep(prev => {
        if (prev >= PROGRESS_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    setupMutation.mutate({
      businessDescription: businessDescription.trim(),
      industry,
      employeeCount: parseInt(employeeCount) || 1,
      locationCount: parseInt(locationCount) || 1,
    });
  }, [
    businessDescription,
    industry,
    employeeCount,
    locationCount,
    setupMutation,
  ]);

  const handleClose = useCallback(() => {
    setStep(1);
    setBusinessDescription('');
    setIndustry('');
    setEmployeeCount('');
    setLocationCount('');
    setResults(null);
    setProgressStep(0);
    onClose();
  }, [onClose]);

  if (!open) return null;

  // Group results by module
  const groupedResults: Record<string, SetupWizardResultItem[]> = {};
  if (results) {
    for (const item of results.results) {
      if (!groupedResults[item.module]) {
        groupedResults[item.module] = [];
      }
      groupedResults[item.module].push(item);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-background shadow-2xl border border-border flex flex-col">
        {/* Header */}
        <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Assistente de Configuracao
              </h2>
              <p className="text-sm text-white/70">
                Descreva seu negocio e o Atlas configura tudo automaticamente
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="relative z-10 flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    step >= s
                      ? 'bg-white text-violet-600'
                      : 'bg-white/20 text-white/60'
                  )}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      'w-12 h-0.5 transition-all',
                      step > s ? 'bg-white' : 'bg-white/20'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Business Description */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descreva seu negocio
                </label>
                <textarea
                  value={businessDescription}
                  onChange={e => setBusinessDescription(e.target.value)}
                  placeholder="Ex: Loja de roupas femininas com 2 filiais, vendemos roupas, acessorios e calcados. Temos 15 funcionarios e trabalhamos com marcas proprias e de terceiros..."
                  rows={5}
                  className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Setor
                  </label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                  >
                    <option value="">Selecione...</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind.value} value={ind.value}>
                        {ind.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Funcionarios
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={employeeCount}
                    onChange={e => setEmployeeCount(e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Locais
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={locationCount}
                    onChange={e => setLocationCount(e.target.value)}
                    placeholder="Ex: 2"
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading / Analyzing */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Bot className="h-10 w-10 text-violet-500 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                  <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold">Analisando...</h3>
                <p className="text-sm text-muted-foreground">
                  O Atlas esta configurando seu sistema
                </p>
              </div>

              <div className="w-full max-w-sm space-y-3">
                {PROGRESS_STEPS.map((label, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-3 text-sm transition-all duration-500',
                      i <= progressStep ? 'opacity-100' : 'opacity-30'
                    )}
                  >
                    {i < progressStep ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : i === progressStep ? (
                      <Loader2 className="h-4 w-4 text-violet-500 animate-spin shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                    )}
                    <span
                      className={cn(
                        i <= progressStep
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && results && (
            <div className="space-y-5">
              {/* Summary */}
              <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <div>
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Configuracao concluida
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {results.summary.success} de {results.summary.total} itens
                      criados com sucesso
                      {results.summary.failed > 0 &&
                        ` (${results.summary.failed} falharam)`}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Results by module */}
              {Object.entries(groupedResults).map(([module, items]) => (
                <div key={module}>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {module}
                  </h4>
                  <div className="space-y-1.5">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          {item.success ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-500" />
                          )}
                          <span>{item.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {item.entity}
                          </Badge>
                        </div>
                        {!item.success && item.error && (
                          <span className="text-xs text-rose-500 truncate max-w-[200px]">
                            {item.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={handleClose}>
            {step === 3 ? 'Fechar' : 'Cancelar'}
          </Button>

          {step === 1 && (
            <Button
              onClick={handleStart}
              disabled={!businessDescription.trim() || !industry}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
            >
              Iniciar Configuracao
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
