/**
 * Fiscal Configuration Page
 * Configuracao do modulo fiscal: provedor, regime tributario, numeracao, certificado digital
 */

'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { FINANCE_PERMISSIONS } from '@/config/rbac/permission-codes';
import {
  useFiscalConfig,
  useUpdateFiscalConfig,
  useUploadCertificate,
} from '@/hooks/finance';
import { usePermissions } from '@/hooks/use-permissions';
import type {
  FiscalProviderType,
  NfeEnvironment,
  TaxRegime,
  UpdateFiscalConfigData,
} from '@/types/fiscal';
import { FISCAL_PROVIDER_LABELS, TAX_REGIME_LABELS } from '@/types/fiscal';
import {
  ChevronDown,
  Cloud,
  FileKey,
  Hash,
  Landmark,
  Loader2,
  Save,
  Shield,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// =============================================================================
// COLLAPSIBLE SECTION COMPONENT
// =============================================================================

function CollapsibleSection({
  icon: Icon,
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white dark:bg-slate-800/60 border border-border">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:bg-muted/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-violet-50 dark:bg-violet-500/8">
                  <Icon className="h-4 w-4 text-violet-700 dark:text-violet-300" />
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function ConfigSkeleton() {
  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Financeiro', href: '/finance' },
            { label: 'Documentos Fiscais', href: '/finance/fiscal' },
            { label: 'Configuracoes' },
          ]}
        />
      </PageHeader>
      <PageBody>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </PageBody>
    </PageLayout>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function FiscalConfigPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { data, isLoading } = useFiscalConfig();
  const updateConfig = useUpdateFiscalConfig();
  const uploadCertificate = useUploadCertificate();

  const canAdmin = hasPermission(FINANCE_PERMISSIONS.FISCAL.ADMIN);

  // Form state
  const [provider, setProvider] = useState<FiscalProviderType>('NUVEM_FISCAL');
  const [environment, setEnvironment] =
    useState<NfeEnvironment>('HOMOLOGATION');
  const [apiKey, setApiKey] = useState('');
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('SIMPLES');
  const [defaultCfop, setDefaultCfop] = useState('');
  const [defaultNaturezaOperacao, setDefaultNaturezaOperacao] = useState('');
  const [defaultSeries, setDefaultSeries] = useState(1);
  const [lastNfeNumber, setLastNfeNumber] = useState(0);
  const [lastNfceNumber, setLastNfceNumber] = useState(0);
  const [nfceEnabled, setNfceEnabled] = useState(false);

  // Certificate
  const [certPassword, setCertPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = data?.config;

  // Populate form from fetched data
  useEffect(() => {
    if (config) {
      setProvider(config.provider);
      setEnvironment(config.environment);
      setTaxRegime(config.taxRegime);
      setDefaultCfop(config.defaultCfop ?? '');
      setDefaultNaturezaOperacao(config.defaultNaturezaOperacao ?? '');
      setDefaultSeries(config.defaultSeries);
      setLastNfeNumber(config.lastNfeNumber);
      setLastNfceNumber(config.lastNfceNumber);
      setNfceEnabled(config.nfceEnabled);
    }
  }, [config]);

  const handleSave = useCallback(async () => {
    const payload: UpdateFiscalConfigData = {
      provider,
      environment,
      taxRegime,
      defaultCfop: defaultCfop || undefined,
      defaultNaturezaOperacao: defaultNaturezaOperacao || undefined,
      defaultSeries,
      nfceEnabled,
      ...(apiKey ? { apiKey } : {}),
    };

    try {
      await updateConfig.mutateAsync(payload);
      toast.success('Configuracoes fiscais salvas com sucesso.');
    } catch {
      toast.error('Erro ao salvar configuracoes fiscais.');
    }
  }, [
    provider,
    environment,
    apiKey,
    taxRegime,
    defaultCfop,
    defaultNaturezaOperacao,
    defaultSeries,
    nfceEnabled,
    updateConfig,
  ]);

  const handleCertificateUpload = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Selecione um arquivo de certificado (.pfx).');
      return;
    }
    if (!certPassword) {
      toast.error('Informe a senha do certificado.');
      return;
    }

    try {
      await uploadCertificate.mutateAsync({ file, password: certPassword });
      toast.success('Certificado digital enviado com sucesso.');
      setCertPassword('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Erro ao enviar certificado digital.');
    }
  }, [certPassword, uploadCertificate]);

  if (isLoading) return <ConfigSkeleton />;

  if (!canAdmin) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Financeiro', href: '/finance' },
              { label: 'Documentos Fiscais', href: '/finance/fiscal' },
              { label: 'Configuracoes' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              Voce nao tem permissao para acessar as configuracoes fiscais.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/finance/fiscal')}
            >
              Voltar
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Financeiro', href: '/finance' },
            { label: 'Documentos Fiscais', href: '/finance/fiscal' },
            { label: 'Configuracoes' },
          ]}
          buttons={[
            {
              id: 'save',
              title: 'Salvar',
              icon: Save,
              onClick: handleSave,
              variant: 'default',
              disabled: updateConfig.isPending,
            },
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Section 1: Provedor de Emissao */}
        <CollapsibleSection
          icon={Cloud}
          title="Provedor de Emissao"
          subtitle="Configure o provedor de emissao de notas fiscais e ambiente"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provedor</Label>
              <Select
                value={provider}
                onValueChange={v => setProvider(v as FiscalProviderType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FISCAL_PROVIDER_LABELS).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chave de API</Label>
              <Input
                type="password"
                placeholder="Insira a chave de API do provedor"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Ambiente</Label>
              <div className="flex items-center gap-4">
                <div
                  className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    environment === 'HOMOLOGATION'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/8'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setEnvironment('HOMOLOGATION')}
                >
                  <p className="font-medium text-sm">Homologacao</p>
                  <p className="text-xs text-muted-foreground">
                    Ambiente de testes (SEFAZ)
                  </p>
                </div>
                <div
                  className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    environment === 'PRODUCTION'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/8'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setEnvironment('PRODUCTION')}
                >
                  <p className="font-medium text-sm">Producao</p>
                  <p className="text-xs text-muted-foreground">
                    Ambiente real de emissao
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 2: Regime Tributario */}
        <CollapsibleSection
          icon={Landmark}
          title="Regime Tributario"
          subtitle="Defina o regime tributario e padroes fiscais da empresa"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Regime Tributario</Label>
              <Select
                value={taxRegime}
                onValueChange={v => setTaxRegime(v as TaxRegime)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o regime" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TAX_REGIME_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>CFOP Padrao</Label>
              <Input
                placeholder="Ex: 5102"
                value={defaultCfop}
                onChange={e => setDefaultCfop(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Natureza da Operacao Padrao</Label>
              <Input
                placeholder="Ex: Venda de Mercadoria"
                value={defaultNaturezaOperacao}
                onChange={e => setDefaultNaturezaOperacao(e.target.value)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 3: Numeracao */}
        <CollapsibleSection
          icon={Hash}
          title="Numeracao"
          subtitle="Configure serie e numeracao de NF-e e NFC-e"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Serie Padrao</Label>
              <Input
                type="number"
                min={1}
                value={defaultSeries}
                onChange={e => setDefaultSeries(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Ultimo Numero NF-e</Label>
              <Input
                type="number"
                min={0}
                value={lastNfeNumber}
                onChange={e => setLastNfeNumber(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Ultimo Numero NFC-e</Label>
              <Input
                type="number"
                min={0}
                value={lastNfceNumber}
                onChange={e => setLastNfceNumber(Number(e.target.value))}
                disabled={!nfceEnabled}
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-3 p-3 rounded-lg border">
              <Switch
                checked={nfceEnabled}
                onCheckedChange={setNfceEnabled}
                id="nfce-enabled"
              />
              <div>
                <Label htmlFor="nfce-enabled" className="cursor-pointer">
                  Habilitar NFC-e
                </Label>
                <p className="text-xs text-muted-foreground">
                  Permite a emissao de Notas Fiscais ao Consumidor Eletronica
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 4: Certificado Digital */}
        <CollapsibleSection
          icon={Shield}
          title="Certificado Digital"
          subtitle="Envie e gerencie o certificado digital A1 para emissao de notas"
        >
          <div className="space-y-6">
            {/* Current certificate info */}
            {config?.certificateId && (
              <div className="p-4 rounded-lg border bg-muted/40">
                <div className="flex items-center gap-2 mb-3">
                  <FileKey className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-sm">Certificado Ativo</span>
                  <Badge variant="success">Valido</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID: </span>
                    <span className="font-mono text-xs">
                      {config.certificateId}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload new certificate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Arquivo do Certificado (.pfx)</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pfx,.p12"
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label>Senha do Certificado</Label>
                <Input
                  type="password"
                  placeholder="Senha do certificado digital"
                  value={certPassword}
                  onChange={e => setCertPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleCertificateUpload}
              disabled={uploadCertificate.isPending}
              className="gap-2"
            >
              {uploadCertificate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Enviar Certificado
            </Button>
          </div>
        </CollapsibleSection>
      </PageBody>
    </PageLayout>
  );
}
