'use client';

/**
 * PunchAgentDownloadCard — compact card linking to the Punch-Agent downloads page.
 *
 * Used in:
 *   - /hr landing page (page.tsx) — quick access card in "Ponto" section
 *   - /hr/punch-devices/downloads — hero section at top of page
 *
 * Shows latest version (from useLatestPunchAgentRelease) + 2 download buttons.
 * Permission-gated: hr.punch-devices.access
 *
 * Plan 10-06 Task 6.3.
 */

import Link from 'next/link';
import { Download, Fingerprint, ArrowRight, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLatestPunchAgentRelease } from '@/hooks/hr/use-punch-agent-download';

interface PunchAgentDownloadCardProps {
  /** When true, renders a compact card suitable for a landing-page grid. */
  compact?: boolean;
}

export function PunchAgentDownloadCard({
  compact = false,
}: PunchAgentDownloadCardProps) {
  const { data, isLoading } = useLatestPunchAgentRelease();

  if (compact) {
    // ── Compact variant: single card for landing page grid ──────────────────
    return (
      <Card
        data-testid="punch-agent-download-card"
        className="overflow-hidden transition-shadow hover:shadow-md"
      >
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">
              Punch-Agent (downloads)
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              Aplicativo desktop para leitores biométricos DigitalPersona e
              Windows Hello.
            </p>
            {isLoading ? (
              <Skeleton className="mt-1.5 h-3.5 w-20" />
            ) : data ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                {data.isFallback ? 'Versão mais recente' : `v${data.version}`}
              </p>
            ) : null}
          </div>
        </div>
        <div className="border-t bg-muted/40 px-4 py-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            data-testid="punch-agent-download-card-link"
          >
            <Link href="/hr/punch-devices/downloads">
              Baixar agente
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  // ── Full variant: hero section on downloads page ──────────────────────────
  return (
    <div
      data-testid="punch-agent-download-hero"
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Fingerprint className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">OpenSea Punch Agent</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aplicativo desktop para usar leitores biométricos DigitalPersona
            U.are.U 4500 ou Windows Hello em quiosques e computadores pessoais.
          </p>
          {isLoading ? (
            <Skeleton className="mt-2 h-4 w-32" />
          ) : data ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              {data.isFallback
                ? 'Versão mais recente disponível'
                : `Versão ${data.version}`}
              {data.publishedAt && !data.isFallback && (
                <span className="text-xs">
                  · publicada em{' '}
                  {new Date(data.publishedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              )}
            </p>
          ) : null}
        </div>
      </div>

      {/* Download buttons */}
      <div className="mt-5 flex flex-wrap gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-9 w-44" />
          </>
        ) : (
          <>
            <Button asChild data-testid="punch-agent-download-msi">
              <a href={data?.msiUrl ?? '#'} download>
                <Download className="mr-2 h-4 w-4" />
                Download MSI
                <span className="ml-1.5 text-xs opacity-75">
                  (recomendado para empresas)
                </span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              data-testid="punch-agent-download-exe"
            >
              <a href={data?.exeUrl ?? '#'} download>
                <Download className="mr-2 h-4 w-4" />
                Download .exe
                <span className="ml-1.5 text-xs opacity-75">
                  (instalação interativa)
                </span>
              </a>
            </Button>
          </>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Windows 10/11 x64. Requer privilégios de administrador para instalação.
      </p>
    </div>
  );
}
