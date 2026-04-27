'use client';

/**
 * /hr/punch-devices/downloads — Punch-Agent download landing page.
 *
 * Shows download buttons for NSIS .exe + MSI installers and a step-by-step
 * pairing guide.
 *
 * Permission gate: hr.punch-devices.access
 * Plan 10-06 Task 6.3.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { PunchAgentDownloadCard } from '@/components/hr/punch/PunchAgentDownloadCard';

// ── Pairing guide steps ────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    step: 1,
    title: 'Gere o código de pareamento',
    body: 'Em RH → Dispositivos de ponto → clique em "Vincular novo dispositivo". Um código de 6 dígitos e um ID de dispositivo serão exibidos.',
  },
  {
    step: 2,
    title: 'Instale o Punch-Agent',
    body: 'Execute o instalador MSI (silencioso via GPO: msiexec /i OpenSeaPunchAgent-Setup-X.Y.Z.msi /quiet /norestart) ou o .exe para instalação interativa.',
  },
  {
    step: 3,
    title: 'Abra o agente e cole o código',
    body: 'Ao abrir o agente pela primeira vez, o assistente de vinculação será exibido. Informe o código de 6 dígitos e o ID do dispositivo.',
  },
  {
    step: 4,
    title: 'Escolha o modo de operação',
    body: 'Selecione "Quiosque compartilhado" para uso por múltiplos funcionários (tela cheia, reset automático) ou "Computador pessoal" para uso individual (bandeja do sistema).',
  },
  {
    step: 5,
    title: 'Confirme o leitor biométrico',
    body: 'O agente detectará automaticamente o leitor DigitalPersona U.are.U 4500 (USB). Caso não tenha o leitor, clique em "Pular" para usar o Windows Hello.',
  },
] as const;

// ── Content ───────────────────────────────────────────────────────────────────

function Content() {
  const { hasPermission } = usePermissions();

  if (!hasPermission('hr.punch-devices.access')) return null;

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Ponto', href: '/hr/punch/dashboard' },
            { label: 'Dispositivos', href: '/hr/punch/health' },
            { label: 'Downloads', href: '/hr/punch-devices/downloads' },
          ]}
        />
        <Header
          title="Baixar OpenSea Punch Agent"
          description="Aplicativo desktop para uso de leitores biométricos DigitalPersona ou Windows Hello em quiosques e computadores pessoais."
        />
      </PageHeader>

      <PageBody>
        <div className="max-w-3xl space-y-8">
          {/* ── Hero download card ─────────────────────────────────────────── */}
          <PunchAgentDownloadCard compact={false} />

          {/* ── System requirements ───────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Requisitos do sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  Windows 10 ou Windows 11 (64 bits)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  Conexão com a internet (para sincronização de batidas)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  Leitor DigitalPersona U.are.U 4500 (opcional — Windows Hello
                  suportado)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  Privilégios de administrador local para instalação
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* ── Pairing guide ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Guia de pareamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-5">
                {GUIDE_STEPS.map(({ step, title, body }) => (
                  <li key={step} className="flex gap-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {step}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* ── Silent install note ───────────────────────────────────────── */}
          <Card className="border-dashed">
            <CardContent className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Implantação corporativa via GPO / SCCM / Intune
              </p>
              <p className="mt-2 font-mono text-xs bg-muted rounded p-2 select-all">
                msiexec /i OpenSeaPunchAgent-Setup-0.1.0.msi /quiet /norestart
                ALLUSERS=1
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                O agente será instalado silenciosamente para todos os usuários
                da máquina. Na primeira abertura, o assistente de vinculação
                será exibido ao usuário logado.
              </p>
            </CardContent>
          </Card>

          {/* ── Back link ─────────────────────────────────────────────────── */}
          <div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Link href="/hr/punch/health">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Voltar para Dispositivos de ponto
              </Link>
            </Button>
          </div>
        </div>
      </PageBody>
    </PageLayout>
  );
}

export default function PunchAgentDownloadsPage() {
  return (
    <Suspense fallback={<GridLoading count={3} layout="list" size="lg" />}>
      <Content />
    </Suspense>
  );
}
