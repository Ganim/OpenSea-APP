/**
 * Punch PWA Distribution Page
 * Página de distribuição da PWA pessoal de ponto.
 *
 * Track 1 do D-01 (CONTEXT.md): RH centralizado distribui a PWA aos
 * colaboradores via QR code + cartaz print-friendly. Funcionário escaneia
 * com a câmera do celular → cai em /punch?source=qr-{tenantId} → instala
 * via banner ou A2HS modal.
 *
 * Sem GitHub Releases fetch (não há binários — é PWA web). QR aponta para
 * `${origin}/punch?source=qr-${tenantId}` para tracking de origem do install.
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { PageActionBar } from '@/components/layout/page-action-bar';
import { useTenant } from '@/contexts/tenant-context';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  HelpCircle,
  Monitor,
  Plus,
  Printer,
  QrCode,
  Share,
  Smartphone,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useMemo, useState } from 'react';
import { FaApple, FaChrome, FaWindows } from 'react-icons/fa';

import { PrintablePunchPwaCartaz } from '@/app/punch/components/printable-punch-pwa-cartaz';

// =============================================================================
// STATIC DATA
// =============================================================================

interface OSStep {
  text: string;
  highlight?: string;
  icon?: React.ElementType;
}

interface OSGuide {
  id: 'android' | 'ios' | 'desktop';
  name: string;
  icon: React.ElementType;
  iconBg: string;
  steps: OSStep[];
}

const OS_GUIDES: OSGuide[] = [
  {
    id: 'android',
    name: 'Android (Chrome)',
    icon: FaChrome,
    iconBg:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    steps: [
      { text: 'Acesse o link da PWA no Chrome do celular.' },
      {
        text: 'Toque no menu do navegador (3 pontos) e procure',
        highlight: 'Instalar app',
      },
      {
        text: 'Confirme tocando em',
        highlight: 'Instalar',
      },
      { text: 'Pronto! O ícone aparece na tela inicial do celular.' },
    ],
  },
  {
    id: 'ios',
    name: 'iOS (Safari)',
    icon: FaApple,
    iconBg:
      'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
    steps: [
      { text: 'Acesse o link da PWA no Safari do iPhone ou iPad.' },
      {
        text: 'Toque no botão Compartilhar na barra inferior.',
        icon: Share,
      },
      {
        text: 'Selecione',
        highlight: 'Adicionar à Tela de Início',
        icon: Plus,
      },
      { text: 'Toque em Adicionar no canto superior direito.' },
    ],
  },
  {
    id: 'desktop',
    name: 'Desktop',
    icon: FaWindows,
    iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    steps: [
      { text: 'Acesse o link da PWA no Chrome, Edge ou Brave.' },
      {
        text: 'Clique no ícone',
        highlight: 'instalar',
        icon: Download,
      },
      { text: 'Confirme a instalação na janela do navegador.' },
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: 'O que é a PWA Punch?',
    answer:
      'É um aplicativo web instalável que permite ao colaborador bater o ponto pelo próprio celular, com GPS, selfie opcional e funciona até offline (envia quando reconectar).',
  },
  {
    question: 'Recebo notificação quando o ponto for confirmado?',
    answer:
      'Sim. Após a primeira batida, o app pede permissão para enviar notificações. Em iOS, é necessário iOS 16.4 ou superior e que o app esteja instalado na Tela de Início.',
  },
  {
    question: 'Funciona sem internet?',
    answer:
      'Sim. As batidas são salvas no dispositivo e sincronizadas automaticamente quando a conexão voltar. Há um indicador visual de sincronização pendente.',
  },
  {
    question: 'Preciso de GPS ativo?',
    answer:
      'Apenas se a empresa exigir geocerca. Configure isso em RH > Configurações > Ponto. Sem geocerca, a localização é apenas registrada para auditoria, sem bloqueio.',
  },
];

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-foreground" />
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="border-b border-border" />
    </div>
  );
}

// =============================================================================
// PAGE
// =============================================================================

export default function PunchPwaDownloadPage() {
  const { currentTenant } = useTenant();
  const [activeOS, setActiveOS] = useState<'android' | 'ios' | 'desktop'>(
    'android'
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const tenantId = currentTenant?.id ?? 'unknown';
  const tenantName = currentTenant?.name ?? null;

  const qrValue = useMemo(() => {
    const base = origin || '';
    return `${base}/punch?source=qr-${tenantId}`;
  }, [origin, tenantId]);

  const handlePrintCartaz = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const activeGuide = OS_GUIDES.find(g => g.id === activeOS) ?? OS_GUIDES[0];

  return (
    <>
      {/* Print-only A4 poster — hidden until window.print() */}
      <PrintablePunchPwaCartaz qrValue={qrValue} tenantName={tenantName} />

      {/* Screen content — hidden during print */}
      <div className="print:hidden">
        <PageLayout>
          <PageHeader>
            <PageActionBar
              breadcrumbItems={[
                { label: 'Dispositivos', href: '/devices' },
                { label: 'Punch PWA' },
              ]}
            />
          </PageHeader>

          <PageBody spacing="gap-6">
            {/* Hero: title + QR code */}
            <Card className="relative overflow-hidden p-4 sm:p-8 md:p-12 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full opacity-80 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full opacity-80 translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-linear-to-br from-violet-500 to-purple-600">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      OpenSea Ponto — PWA
                    </h1>
                  </div>

                  <p className="text-sm sm:text-lg text-gray-600 dark:text-white/60 mb-6 max-w-2xl">
                    Distribua aos colaboradores para bater ponto pelo celular —
                    com GPS, selfie opcional e funcionamento offline.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handlePrintCartaz}
                      className="gap-2"
                      size="sm"
                    >
                      <Printer className="size-4" />
                      Imprimir cartaz
                    </Button>
                    <a
                      href={qrValue}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                      <QrCode className="size-4" />
                      Abrir link da PWA
                    </a>
                  </div>
                </div>

                <div
                  data-testid="punch-pwa-qr"
                  className="bg-white p-3 rounded-2xl border-2 border-violet-200 dark:border-violet-500/30 shrink-0"
                >
                  {origin ? (
                    <QRCodeCanvas value={qrValue} size={200} level="M" />
                  ) : (
                    <div className="size-[200px] flex items-center justify-center text-xs text-slate-400">
                      Gerando QR...
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Install steps per OS — tabs */}
            <section>
              <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
                <SectionHeader
                  icon={Download}
                  title="Como instalar"
                  subtitle="Selecione o sistema operacional do colaborador"
                />

                <div className="flex flex-wrap gap-2 mt-6 mb-6 border-b border-border pb-2">
                  {OS_GUIDES.map(guide => {
                    const GuideIcon = guide.icon;
                    const active = activeOS === guide.id;
                    return (
                      <button
                        key={guide.id}
                        type="button"
                        onClick={() => setActiveOS(guide.id)}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                            : 'text-muted-foreground hover:bg-accent'
                        )}
                      >
                        <GuideIcon className="size-4" />
                        {guide.name}
                      </button>
                    );
                  })}
                </div>

                <ol className="space-y-3">
                  {activeGuide.steps.map((step, i) => {
                    const StepIcon = step.icon;
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className={cn(
                            'size-7 shrink-0 rounded-full font-bold text-sm flex items-center justify-center',
                            activeGuide.iconBg
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-200 pt-0.5">
                          {step.text}
                          {step.icon && StepIcon && (
                            <StepIcon className="inline size-4 mx-1 text-slate-500 dark:text-slate-400" />
                          )}
                          {step.highlight && (
                            <strong className="ml-1">{step.highlight}</strong>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-6 rounded-lg bg-violet-50 dark:bg-violet-500/8 border border-violet-200 dark:border-violet-500/20 p-3 flex items-start gap-2">
                  <CheckCircle className="size-4 text-violet-600 dark:text-violet-300 shrink-0 mt-0.5" />
                  <p className="text-xs text-violet-700 dark:text-violet-200">
                    Após instalar, o colaborador faz login com a mesma conta do
                    dashboard — não precisa de cadastro extra.
                  </p>
                </div>
              </Card>
            </section>

            {/* FAQ */}
            <section>
              <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
                <SectionHeader
                  icon={HelpCircle}
                  title="Perguntas Frequentes"
                  subtitle="Dúvidas comuns sobre a PWA Punch"
                />
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50 mt-6">
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i} className="py-3 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        className="flex items-center justify-between w-full text-left"
                        onClick={() =>
                          setExpandedFaq(expandedFaq === i ? null : i)
                        }
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white pr-4">
                          {item.question}
                        </span>
                        {expandedFaq === i ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                      </button>
                      {expandedFaq === i && (
                        <p className="text-sm text-muted-foreground mt-2 pr-8">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* Footer hint */}
            <section>
              <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
                <div className="flex items-start gap-3">
                  <Monitor className="size-5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Cartaz para o relógio físico
                    </p>
                    <p className="text-sm text-muted-foreground">
                      O botão{' '}
                      <strong className="text-slate-700 dark:text-slate-200">
                        Imprimir cartaz
                      </strong>{' '}
                      gera uma versão A4 com o QR code central — cole próximo ao
                      relógio físico para que os colaboradores instalem o app
                      escaneando.
                    </p>
                  </div>
                </div>
              </Card>
            </section>
          </PageBody>
        </PageLayout>
      </div>
    </>
  );
}
