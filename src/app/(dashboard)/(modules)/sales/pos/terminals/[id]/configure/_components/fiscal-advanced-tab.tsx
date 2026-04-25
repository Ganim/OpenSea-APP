'use client';

import { useEffect } from 'react';
import { Settings2, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUpdateTerminalSessionMode } from '@/hooks/sales/use-update-terminal-session-mode';
import type {
  PosCoordinationMode,
  PosOperatorSessionMode,
  PosTerminal,
} from '@/types/sales';

const formSchema = z.object({
  operatorSessionMode: z.enum(['PER_SALE', 'STAY_LOGGED_IN']),
  operatorSessionTimeout: z
    .union([z.coerce.number().int().min(1).max(480), z.literal('')])
    .optional()
    .transform(value => (value === '' || value === undefined ? null : value)),
  autoCloseSessionAt: z
    .union([
      z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato HH:MM (24h).'),
      z.literal(''),
    ])
    .optional()
    .transform(value => (value === '' || value === undefined ? null : value)),
  coordinationMode: z.enum(['STANDALONE', 'SELLER', 'CASHIER', 'BOTH']),
});

type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

const COORDINATION_OPTIONS: Array<{
  value: PosCoordinationMode;
  label: string;
  description: string;
}> = [
  {
    value: 'STANDALONE',
    label: 'Venda + caixa no mesmo terminal',
    description:
      'O operador lança o pedido e finaliza o pagamento no próprio terminal.',
  },
  {
    value: 'SELLER',
    label: 'Somente venda (encaminha para caixa)',
    description:
      'O operador lança o pedido e envia para um terminal de caixa cobrar.',
  },
  {
    value: 'CASHIER',
    label: 'Somente caixa',
    description:
      'Recebe pedidos pendentes vindos de outros terminais e cobra clientes.',
  },
  {
    value: 'BOTH',
    label: 'Vender e cobrar com fallback',
    description:
      'Funciona como caixa, mas pode lançar vendas próprias quando necessário.',
  },
];

export function FiscalAdvancedTab({ terminal }: { terminal: PosTerminal }) {
  const update = useUpdateTerminalSessionMode(terminal.id);

  const defaultValues: FormInput = {
    operatorSessionMode:
      (terminal.operatorSessionMode as PosOperatorSessionMode) ?? 'PER_SALE',
    operatorSessionTimeout: terminal.operatorSessionTimeout ?? '',
    autoCloseSessionAt: terminal.autoCloseSessionAt ?? '',
    coordinationMode:
      (terminal.coordinationMode as PosCoordinationMode) ?? 'STANDALONE',
  };

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset the form when navigating between terminals.
  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminal.id]);

  const sessionMode = form.watch('operatorSessionMode');

  const onSubmit = (values: FormOutput) => {
    update.mutate({
      operatorSessionMode: values.operatorSessionMode,
      operatorSessionTimeout: values.operatorSessionTimeout ?? null,
      autoCloseSessionAt: values.autoCloseSessionAt ?? null,
      coordinationMode: values.coordinationMode,
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      data-testid="fiscal-advanced-tab"
    >
      {/* Sessão do operador */}
      <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <Settings2 className="h-5 w-5 text-foreground" />
          <div className="flex-1">
            <h3 className="text-base font-semibold">Sessão do operador</h3>
            <p className="text-sm text-muted-foreground">
              Define como o operador se identifica entre vendas neste terminal.
            </p>
          </div>
        </div>
        <div className="border-b border-border" />
        <div className="space-y-5 p-4 sm:p-6">
          <RadioGroup
            value={form.watch('operatorSessionMode')}
            onValueChange={value =>
              form.setValue(
                'operatorSessionMode',
                value as PosOperatorSessionMode,
                { shouldDirty: true }
              )
            }
            className="space-y-3"
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem
                value="PER_SALE"
                id="session-per-sale"
                className="mt-1"
                data-testid="session-mode-per-sale"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="session-per-sale"
                  className="text-sm font-medium"
                >
                  Pedir código curto a cada venda
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recomendado para terminais com múltiplos vendedores ou alta
                  rotatividade.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RadioGroupItem
                value="STAY_LOGGED_IN"
                id="session-stay-logged"
                className="mt-1"
                data-testid="session-mode-stay-logged"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="session-stay-logged"
                  className="text-sm font-medium"
                >
                  Manter operador logado até troca manual
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recomendado para caixa fixo com um único operador por turno.
                </p>
              </div>
            </div>
          </RadioGroup>

          <div className="grid gap-4 md:grid-cols-2">
            {sessionMode === 'STAY_LOGGED_IN' && (
              <div className="space-y-1.5">
                <Label htmlFor="session-timeout">
                  Timeout de inatividade (minutos)
                </Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min={1}
                  max={480}
                  inputMode="numeric"
                  placeholder="Ex.: 15"
                  {...form.register('operatorSessionTimeout')}
                  data-testid="session-timeout"
                />
                {form.formState.errors.operatorSessionTimeout && (
                  <p className="text-xs text-rose-600">
                    Informe um valor entre 1 e 480 minutos.
                  </p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="auto-close">
                Fechamento automático da sessão (HH:MM)
              </Label>
              <Input
                id="auto-close"
                type="time"
                {...form.register('autoCloseSessionAt')}
                data-testid="auto-close-session"
              />
              {form.formState.errors.autoCloseSessionAt && (
                <p className="text-xs text-rose-600">
                  {form.formState.errors.autoCloseSessionAt.message ??
                    'Use o formato HH:MM (24h).'}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Coordenação */}
      <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <Sparkles className="h-5 w-5 text-foreground" />
          <div className="flex-1">
            <h3 className="text-base font-semibold">Modo de coordenação</h3>
            <p className="text-sm text-muted-foreground">
              Define como este terminal coopera com os demais terminais do
              tenant.
            </p>
          </div>
        </div>
        <div className="border-b border-border" />
        <div className="p-4 sm:p-6">
          <RadioGroup
            value={form.watch('coordinationMode')}
            onValueChange={value =>
              form.setValue('coordinationMode', value as PosCoordinationMode, {
                shouldDirty: true,
              })
            }
            className="space-y-3"
          >
            {COORDINATION_OPTIONS.map(opt => (
              <div key={opt.value} className="flex items-start gap-3">
                <RadioGroupItem
                  value={opt.value}
                  id={`coord-${opt.value}`}
                  className="mt-1"
                  data-testid={`coord-${opt.value}`}
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor={`coord-${opt.value}`}
                    className="text-sm font-medium"
                  >
                    {opt.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </Card>

      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <strong>Em breve (Fase 2):</strong> PIN administrativo local, perfil
        replicável entre terminais e override fiscal por terminal.
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => form.reset(defaultValues)}
          disabled={update.isPending || !form.formState.isDirty}
        >
          Descartar
        </Button>
        <Button
          type="submit"
          disabled={update.isPending}
          data-testid="fiscal-advanced-save"
        >
          {update.isPending ? 'Salvando…' : 'Salvar configuração'}
        </Button>
      </div>
    </form>
  );
}
