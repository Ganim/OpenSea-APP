'use client';

import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Download,
  LogIn,
  LogOut,
  RotateCcw,
  Waves,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { usePunchClockIn, usePunchClockOut } from './api/mutations';
import { LiveClock } from './components/live-clock';
import { LocationDisplay } from './components/location-display';
import { SelfieCapture } from './components/selfie-capture';
import type { TimeEntry } from '@/types/hr';

type PunchType = 'CLOCK_IN' | 'CLOCK_OUT';

interface PunchResult {
  entry: TimeEntry;
  type: PunchType;
  timestamp: Date;
}

function PunchPageContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employeeId') ?? '';
  const employeeName = searchParams.get('name') ?? '';

  const { user, isAuthenticated } = useAuth();

  // State
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [punchResult, setPunchResult] = useState<PunchResult | null>(null);
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Mutations
  const clockIn = usePunchClockIn();
  const clockOut = usePunchClockOut();

  const isLoading = clockIn.isPending || clockOut.isPending;

  const resolvedEmployeeId = employeeId || user?.id || '';

  const handleLocationReady = useCallback((lat: number, lng: number) => {
    locationRef.current = { lat, lng };
  }, []);

  const handlePunch = useCallback(
    async (type: PunchType) => {
      if (!resolvedEmployeeId) {
        toast.error('Identificação do colaborador não encontrada.');
        return;
      }

      if (!selfieData) {
        toast.error('Capture sua foto antes de registrar o ponto.');
        return;
      }

      const mutation = type === 'CLOCK_IN' ? clockIn : clockOut;
      const label = type === 'CLOCK_IN' ? 'Entrada' : 'Saída';

      try {
        const entry = await mutation.mutateAsync({
          employeeId: resolvedEmployeeId,
          latitude: locationRef.current?.lat,
          longitude: locationRef.current?.lng,
          notes: selfieData ? 'Selfie capturada no registro' : undefined,
        });

        setPunchResult({
          entry,
          type,
          timestamp: new Date(),
        });

        toast.success(`${label} registrada com sucesso!`);
      } catch {
        toast.error(`Erro ao registrar ${label.toLowerCase()}.`);
      }
    },
    [resolvedEmployeeId, selfieData, clockIn, clockOut]
  );

  const handleReset = useCallback(() => {
    setPunchResult(null);
    setSelfieData(null);
  }, []);

  const handleDownloadReceipt = useCallback(() => {
    if (!punchResult) return;

    const label = punchResult.type === 'CLOCK_IN' ? 'Entrada' : 'Saída';
    const time = punchResult.timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const date = punchResult.timestamp.toLocaleDateString('pt-BR');

    const content = [
      '===================================',
      '       COMPROVANTE DE PONTO        ',
      '===================================',
      '',
      `Colaborador: ${employeeName || 'N/A'}`,
      `Tipo: ${label}`,
      `Data: ${date}`,
      `Horário: ${time}`,
      `ID do Registro: ${punchResult.entry.id}`,
      '',
      locationRef.current
        ? `Localização: ${locationRef.current.lat.toFixed(6)}, ${locationRef.current.lng.toFixed(6)}`
        : 'Localização: Não disponível',
      '',
      '===================================',
      '        OpenSea Ponto Digital       ',
      '===================================',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante-ponto-${date.replace(/\//g, '-')}-${time.replace(/:/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [punchResult, employeeName]);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
        <Waves className="size-12 text-violet-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Acesso Necessário</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Faça login para registrar seu ponto.
        </p>
      </div>
    );
  }

  // No employee ID
  if (!resolvedEmployeeId) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
        <Waves className="size-12 text-violet-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Colaborador Não Identificado</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Acesse esta página através do QR Code ou link fornecido pela empresa.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700/50">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex size-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
            <Waves className="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-base font-bold">OpenSea Ponto</h1>
            {employeeName && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {employeeName}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-lg space-y-4 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {punchResult ? (
          /* Success Result */
          <div className="space-y-4">
            <div
              className={cn(
                'rounded-2xl p-5 border',
                'bg-emerald-50 dark:bg-emerald-950/30',
                'border-emerald-200 dark:border-emerald-800'
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="size-7 text-emerald-500" />
                <div>
                  <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                    Ponto Registrado!
                  </h2>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Registro #{punchResult.entry.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-600/80 dark:text-emerald-400/80">
                    Tipo
                  </span>
                  <span
                    className={cn(
                      'font-semibold',
                      punchResult.type === 'CLOCK_IN'
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-rose-700 dark:text-rose-300'
                    )}
                  >
                    {punchResult.type === 'CLOCK_IN' ? 'Entrada' : 'Saída'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-600/80 dark:text-emerald-400/80">
                    Horário
                  </span>
                  <span className="font-semibold tabular-nums text-emerald-800 dark:text-emerald-200">
                    {punchResult.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-600/80 dark:text-emerald-400/80">
                    Data
                  </span>
                  <span className="font-medium text-emerald-800 dark:text-emerald-200">
                    {punchResult.timestamp.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {locationRef.current && (
                  <div className="flex justify-between">
                    <span className="text-emerald-600/80 dark:text-emerald-400/80">
                      Localização
                    </span>
                    <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300 tabular-nums">
                      {locationRef.current.lat.toFixed(4)},{' '}
                      {locationRef.current.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>

              {selfieData && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <img
                    src={selfieData}
                    alt="Foto do registro"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-2xl h-14',
                  'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                  'text-slate-700 dark:text-slate-200 font-semibold text-sm',
                  'active:scale-[0.98] transition-all'
                )}
              >
                <Download className="size-4" />
                Comprovante
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-2xl h-14',
                  'bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm',
                  'active:scale-[0.98] transition-all shadow-sm'
                )}
              >
                <RotateCcw className="size-4" />
                Novo Registro
              </button>
            </div>
          </div>
        ) : (
          /* Punch Form */
          <div className="space-y-4">
            {/* Selfie */}
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-lg">
              <SelfieCapture
                onCapture={setSelfieData}
                captured={selfieData ?? undefined}
                onRetake={() => setSelfieData(null)}
                disabled={isLoading}
              />
            </div>

            {/* Location */}
            <LocationDisplay onLocationReady={handleLocationReady} />

            {/* Clock */}
            <LiveClock />

            {/* Punch Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePunch('CLOCK_IN')}
                disabled={isLoading || !selfieData}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl h-16',
                  'bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base',
                  'active:scale-[0.97] transition-all shadow-sm',
                  'disabled:opacity-50 disabled:pointer-events-none'
                )}
              >
                <LogIn className="size-5" />
                <span>Entrada</span>
              </button>
              <button
                type="button"
                onClick={() => handlePunch('CLOCK_OUT')}
                disabled={isLoading || !selfieData}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl h-16',
                  'bg-rose-500 hover:bg-rose-600 text-white font-bold text-base',
                  'active:scale-[0.97] transition-all shadow-sm',
                  'disabled:opacity-50 disabled:pointer-events-none'
                )}
              >
                <LogOut className="size-5" />
                <span>Saída</span>
              </button>
            </div>

            {/* Helper text */}
            {!selfieData && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Capture sua foto para habilitar o registro de ponto.
              </p>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="size-4 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Registrando ponto...
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function PunchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="size-8 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
        </div>
      }
    >
      <PunchPageContent />
    </Suspense>
  );
}
