'use client';

import { useEffect, useMemo } from 'react';
import { Receipt, ShieldCheck } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUpdatePosFiscalConfig } from '@/hooks/sales/use-pos-fiscal-config';
import type {
  PosFiscalConfig,
  PosFiscalDocumentType,
  PosFiscalEmissionMode,
  UpdatePosFiscalConfigRequest,
} from '@/types/sales';

const DOCUMENT_TYPES: Array<{
  value: PosFiscalDocumentType;
  label: string;
  description: string;
}> = [
  {
    value: 'NFE',
    label: 'NF-e',
    description: 'Nota Fiscal Eletrônica para vendas a CNPJ.',
  },
  {
    value: 'NFC_E',
    label: 'NFC-e',
    description: 'Nota Fiscal de Consumidor Eletrônica para vendas no varejo.',
  },
  {
    value: 'SAT_CFE',
    label: 'SAT CF-e',
    description: 'Cupom Fiscal Eletrônico via equipamento SAT (SP).',
  },
  {
    value: 'MFE',
    label: 'MF-e',
    description: 'Módulo Fiscal Eletrônico (CE).',
  },
];

const EMISSION_MODES: Array<{
  value: PosFiscalEmissionMode;
  label: string;
  description: string;
  disabled?: boolean;
  disabledReason?: string;
}> = [
  {
    value: 'ONLINE_SYNC',
    label: 'Online (síncrono)',
    description:
      'Cada venda emite o documento na hora junto com a SEFAZ. Recomendado quando há internet estável.',
  },
  {
    value: 'OFFLINE_CONTINGENCY',
    label: 'Contingência offline',
    description:
      'Permite emitir mesmo sem conexão e sincronizar depois. Disponível na Fase 2.',
    disabled: true,
    disabledReason: 'Disponível na Fase 2',
  },
  {
    value: 'NONE',
    label: 'Sem emissão fiscal',
    description:
      'Use para ambientes de testes ou tenants que ainda não emitem documentos pelo POS.',
  },
];

const formSchema = z
  .object({
    enabledDocumentTypes: z
      .array(z.enum(['NFE', 'NFC_E', 'SAT_CFE', 'MFE']))
      .min(1, 'Selecione ao menos um tipo de documento.'),
    defaultDocumentType: z.enum(['NFE', 'NFC_E', 'SAT_CFE', 'MFE']),
    emissionMode: z.enum(['ONLINE_SYNC', 'OFFLINE_CONTINGENCY', 'NONE']),
    nfceSeries: z
      .union([z.coerce.number().int().positive(), z.literal('')])
      .optional()
      .transform(value => (value === '' || value === undefined ? null : value)),
    nfceNextNumber: z
      .union([z.coerce.number().int().positive(), z.literal('')])
      .optional()
      .transform(value => (value === '' || value === undefined ? null : value)),
    certificatePath: z
      .string()
      .max(500)
      .optional()
      .transform(value =>
        !value || value.trim() === '' ? null : value.trim()
      ),
    satDeviceId: z
      .string()
      .max(120)
      .optional()
      .transform(value =>
        !value || value.trim() === '' ? null : value.trim()
      ),
  })
  .superRefine((value, ctx) => {
    if (!value.enabledDocumentTypes.includes(value.defaultDocumentType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['defaultDocumentType'],
        message: 'O documento padrão deve estar entre os habilitados.',
      });
    }
    if (value.emissionMode === 'OFFLINE_CONTINGENCY') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['emissionMode'],
        message:
          'Modo offline ainda não está disponível. Selecione Online (síncrono) ou Sem emissão.',
      });
    }
    if (
      value.defaultDocumentType === 'NFC_E' &&
      value.emissionMode === 'ONLINE_SYNC'
    ) {
      if (!value.nfceSeries) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['nfceSeries'],
          message: 'Informe a série NFC-e.',
        });
      }
      if (!value.nfceNextNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['nfceNextNumber'],
          message: 'Informe o próximo número NFC-e.',
        });
      }
    }
  });

type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

interface FiscalConfigFormProps {
  config: PosFiscalConfig | null;
}

export function FiscalConfigForm({ config }: FiscalConfigFormProps) {
  const update = useUpdatePosFiscalConfig();

  const defaultValues: FormInput = useMemo(
    () => ({
      enabledDocumentTypes: config?.enabledDocumentTypes ?? ['NFC_E'],
      defaultDocumentType: config?.defaultDocumentType ?? 'NFC_E',
      emissionMode: config?.emissionMode ?? 'NONE',
      nfceSeries: config?.nfceSeries ?? '',
      nfceNextNumber: config?.nfceNextNumber ?? '',
      certificatePath: config?.certificatePath ?? '',
      satDeviceId: config?.satDeviceId ?? '',
    }),
    [config]
  );

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema) as Resolver<
      FormInput,
      unknown,
      FormOutput
    >,
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.id]);

  const enabled = form.watch('enabledDocumentTypes') ?? [];
  const defaultDoc = form.watch('defaultDocumentType');
  const emissionMode = form.watch('emissionMode');

  const toggleEnabled = (doc: PosFiscalDocumentType, checked: boolean) => {
    const current = form.getValues('enabledDocumentTypes') ?? [];
    if (checked) {
      if (!current.includes(doc)) {
        form.setValue('enabledDocumentTypes', [...current, doc], {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    } else {
      form.setValue(
        'enabledDocumentTypes',
        current.filter(d => d !== doc),
        { shouldDirty: true, shouldValidate: true }
      );
    }
  };

  const onSubmit = (values: FormOutput) => {
    const payload: UpdatePosFiscalConfigRequest = {
      enabledDocumentTypes: values.enabledDocumentTypes,
      defaultDocumentType: values.defaultDocumentType,
      emissionMode: values.emissionMode,
      certificatePath: values.certificatePath ?? null,
      nfceSeries: values.nfceSeries ?? null,
      nfceNextNumber: values.nfceNextNumber ?? null,
      satDeviceId: values.satDeviceId ?? null,
    };
    update.mutate(payload);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      data-testid="fiscal-config-form"
    >
      <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <Receipt className="h-5 w-5 text-foreground" />
          <div className="flex-1">
            <h3 className="text-base font-semibold">Documentos habilitados</h3>
            <p className="text-sm text-muted-foreground">
              Selecione os tipos de documento que este tenant emite.
            </p>
          </div>
        </div>
        <div className="border-b border-border" />
        <div className="space-y-3 p-4 sm:p-6">
          {DOCUMENT_TYPES.map(doc => (
            <label
              key={doc.value}
              className="flex items-start gap-3 rounded-md border border-border bg-white p-3 dark:bg-white/[0.02]"
            >
              <Checkbox
                checked={enabled.includes(doc.value)}
                onCheckedChange={checked => toggleEnabled(doc.value, !!checked)}
                data-testid={`fiscal-enabled-${doc.value}`}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{doc.label}</div>
                <div className="text-xs text-muted-foreground">
                  {doc.description}
                </div>
              </div>
            </label>
          ))}
          {form.formState.errors.enabledDocumentTypes && (
            <p className="text-xs text-rose-600">
              {form.formState.errors.enabledDocumentTypes.message}
            </p>
          )}
        </div>
      </Card>

      <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <ShieldCheck className="h-5 w-5 text-foreground" />
          <div className="flex-1">
            <h3 className="text-base font-semibold">Documento padrão</h3>
            <p className="text-sm text-muted-foreground">
              Tipo emitido quando o operador não escolhe explicitamente outro.
            </p>
          </div>
        </div>
        <div className="border-b border-border" />
        <div className="p-4 sm:p-6">
          <RadioGroup
            value={defaultDoc}
            onValueChange={value =>
              form.setValue(
                'defaultDocumentType',
                value as PosFiscalDocumentType,
                { shouldDirty: true, shouldValidate: true }
              )
            }
            className="grid gap-2 sm:grid-cols-2"
          >
            {DOCUMENT_TYPES.map(doc => {
              const isEnabled = enabled.includes(doc.value);
              return (
                <div
                  key={doc.value}
                  className={`flex items-center gap-2 rounded-md border border-border p-3 ${isEnabled ? 'bg-white dark:bg-white/[0.02]' : 'bg-muted/40 opacity-60'}`}
                >
                  <RadioGroupItem
                    value={doc.value}
                    id={`default-${doc.value}`}
                    disabled={!isEnabled}
                    data-testid={`fiscal-default-${doc.value}`}
                  />
                  <Label
                    htmlFor={`default-${doc.value}`}
                    className="text-sm font-medium"
                  >
                    {doc.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
          {form.formState.errors.defaultDocumentType && (
            <p className="mt-2 text-xs text-rose-600">
              {form.formState.errors.defaultDocumentType.message}
            </p>
          )}
        </div>
      </Card>

      <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <Receipt className="h-5 w-5 text-foreground" />
          <div className="flex-1">
            <h3 className="text-base font-semibold">Modo de emissão</h3>
            <p className="text-sm text-muted-foreground">
              Como os documentos são transmitidos para a SEFAZ.
            </p>
          </div>
        </div>
        <div className="border-b border-border" />
        <div className="p-4 sm:p-6">
          <RadioGroup
            value={emissionMode}
            onValueChange={value =>
              form.setValue('emissionMode', value as PosFiscalEmissionMode, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="space-y-2"
          >
            {EMISSION_MODES.map(opt => (
              <div
                key={opt.value}
                className={`flex items-start gap-3 rounded-md border border-border p-3 ${opt.disabled ? 'bg-muted/40 opacity-70' : 'bg-white dark:bg-white/[0.02]'}`}
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`emission-${opt.value}`}
                  disabled={opt.disabled}
                  className="mt-1"
                  data-testid={`fiscal-mode-${opt.value}`}
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor={`emission-${opt.value}`}
                    className="text-sm font-medium"
                  >
                    {opt.label}
                    {opt.disabled && (
                      <span className="ml-2 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-normal text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                        {opt.disabledReason}
                      </span>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {form.formState.errors.emissionMode && (
            <p className="mt-2 text-xs text-rose-600">
              {form.formState.errors.emissionMode.message}
            </p>
          )}
        </div>
      </Card>

      {enabled.includes('NFC_E') && (
        <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <Receipt className="h-5 w-5 text-foreground" />
            <div className="flex-1">
              <h3 className="text-base font-semibold">Numeração NFC-e</h3>
              <p className="text-sm text-muted-foreground">
                Série e próximo número usados nas próximas emissões.
              </p>
            </div>
          </div>
          <div className="border-b border-border" />
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <div className="space-y-1.5">
              <Label htmlFor="nfce-series">Série</Label>
              <Input
                id="nfce-series"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="Ex.: 1"
                {...form.register('nfceSeries')}
                data-testid="fiscal-nfce-series"
              />
              {form.formState.errors.nfceSeries && (
                <p className="text-xs text-rose-600">
                  {form.formState.errors.nfceSeries.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nfce-next">Próximo número</Label>
              <Input
                id="nfce-next"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="Ex.: 1"
                {...form.register('nfceNextNumber')}
                data-testid="fiscal-nfce-next-number"
              />
              {form.formState.errors.nfceNextNumber && (
                <p className="text-xs text-rose-600">
                  {form.formState.errors.nfceNextNumber.message}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <ShieldCheck className="h-5 w-5 text-foreground" />
          <div className="flex-1">
            <h3 className="text-base font-semibold">Certificado e SAT</h3>
            <p className="text-sm text-muted-foreground">
              Caminho do certificado A1/A3 e identificador do SAT, quando
              aplicável.
            </p>
          </div>
        </div>
        <div className="border-b border-border" />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cert-path">Caminho do certificado</Label>
            <Input
              id="cert-path"
              placeholder="Ex.: /certs/cert-tenant.pfx"
              {...form.register('certificatePath')}
              data-testid="fiscal-cert-path"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sat-id">Identificador do equipamento SAT</Label>
            <Input
              id="sat-id"
              placeholder="Ex.: SAT-001"
              {...form.register('satDeviceId')}
              data-testid="fiscal-sat-id"
            />
          </div>
        </div>
      </Card>

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
          data-testid="fiscal-config-save"
        >
          {update.isPending ? 'Salvando…' : 'Salvar configuração fiscal'}
        </Button>
      </div>
    </form>
  );
}
