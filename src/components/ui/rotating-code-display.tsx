'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface RotatingCodeDisplayProps {
  code: string;
  expiresAt: string | Date;
  periodSeconds: number;
  /** Chamado quando o countdown expira — útil para o parent refazer o fetch. */
  onRotate?: () => void;
  /** Classe extra do wrapper. */
  className?: string;
  /** Exibir o botão de copiar (default: true). */
  showCopyButton?: boolean;
}

/**
 * Exibe um código rotativo estilo TOTP: dígitos em fonte grande
 * monoespaçada + countdown circular (SVG) indicando quanto tempo
 * resta até a próxima rotação. Quando o tempo zera, dispara `onRotate`
 * para o consumidor decidir como refazer a busca.
 */
export function RotatingCodeDisplay({
  code,
  expiresAt,
  periodSeconds,
  onRotate,
  className,
  showCopyButton = true,
}: RotatingCodeDisplayProps) {
  const expiresAtMs = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);

  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000))
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let triggered = false;
    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0 && !triggered) {
        triggered = true;
        onRotate?.();
      }
    };
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [expiresAtMs, onRotate]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, secondsLeft / periodSeconds));
  const dashOffset = circumference * (1 - progress);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Código copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar. Tente manualmente.');
    }
  };

  // Formata o código em dois grupos de 3 para facilitar leitura em voz alta.
  const left = code.slice(0, Math.ceil(code.length / 2));
  const right = code.slice(Math.ceil(code.length / 2));

  const colorClass =
    secondsLeft <= 10
      ? 'text-rose-500'
      : secondsLeft <= 20
        ? 'text-amber-500'
        : 'text-emerald-500';

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-5 p-6 rounded-2xl border border-border bg-muted/40',
        className
      )}
    >
      <div className="flex items-center gap-6">
        {/* Countdown circular */}
        <div className="relative w-16 h-16 shrink-0">
          <svg
            className="w-16 h-16 -rotate-90"
            viewBox="0 0 64 64"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-muted-foreground/20"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              className={cn('transition-all duration-500', colorClass)}
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold tabular-nums',
              colorClass
            )}
          >
            {secondsLeft}s
          </span>
        </div>

        {/* Código */}
        <div className="flex items-baseline gap-3 font-mono font-bold tabular-nums text-4xl sm:text-5xl tracking-widest select-all">
          <span>{left}</span>
          <span className="text-muted-foreground/40 text-3xl">·</span>
          <span>{right}</span>
        </div>
      </div>

      {showCopyButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar código
            </>
          )}
        </Button>
      )}
    </div>
  );
}
