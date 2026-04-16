/**
 * OpenSea OS - Score Slider (1 a 5 com half-star)
 *
 * Slider compacto 0-5 com passo 0.5 + indicador visual de 5 estrelas
 * (golden, com half-star). Usado em performance review e competencias.
 *
 * Inspirado no padrao Lattice (radar 1-5) e no Airbnb (rating slider).
 */

'use client';

import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Star, StarHalf } from 'lucide-react';

export interface ScoreSliderProps {
  /** Valor 0-5 (multiplo de 0.5). Use null para "nao avaliado". */
  value: number | null;
  /** Callback disparado em cada drag. */
  onChange: (next: number) => void;
  /** Desabilita interacao (modo readonly). */
  disabled?: boolean;
  /** Esconde o widget de estrelas. Mantem somente o slider. */
  hideStars?: boolean;
  /** Esconde o numero (ex: 4,5) ao lado das estrelas. */
  hideNumber?: boolean;
  /** Cor das estrelas preenchidas. Padrao: amber (golden). */
  starColorClass?: string;
  /** Identificador para data-testid. */
  testId?: string;
  /** Largura do slider (CSS class). Padrao: w-full. */
  className?: string;
}

const SCORE_DESCRIPTIONS: Record<number, string> = {
  0: 'Nao avaliado',
  1: 'Insuficiente',
  2: 'Regular',
  3: 'Bom',
  4: 'Muito bom',
  5: 'Excelente',
};

function formatScore(score: number | null): string {
  if (score === null) return '—';
  return score.toFixed(1).replace('.', ',');
}

function getDescriptionFor(score: number | null): string {
  if (score === null) return SCORE_DESCRIPTIONS[0];
  const rounded = Math.round(score);
  return SCORE_DESCRIPTIONS[rounded] ?? '';
}

/**
 * Renderiza 5 estrelas. Cada slot pode estar:
 *   - cheio (score >= slot)
 *   - meia-estrela (score >= slot - 0.5)
 *   - vazio (caso contrario)
 */
function StarRow({
  score,
  starColorClass,
}: {
  score: number;
  starColorClass: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(slot => {
        const isFull = score >= slot;
        const isHalf = !isFull && score >= slot - 0.5;
        if (isFull) {
          return (
            <Star
              key={slot}
              className={cn('h-3.5 w-3.5', starColorClass)}
              fill="currentColor"
            />
          );
        }
        if (isHalf) {
          return (
            <span key={slot} className="relative h-3.5 w-3.5 inline-block">
              <Star className="absolute inset-0 h-3.5 w-3.5 text-slate-300 dark:text-slate-700" />
              <StarHalf
                className={cn(
                  'absolute inset-0 h-3.5 w-3.5',
                  starColorClass
                )}
                fill="currentColor"
              />
            </span>
          );
        }
        return (
          <Star
            key={slot}
            className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700"
          />
        );
      })}
    </div>
  );
}

export function ScoreSlider({
  value,
  onChange,
  disabled = false,
  hideStars = false,
  hideNumber = false,
  starColorClass = 'text-amber-400',
  testId,
  className,
}: ScoreSliderProps) {
  const displayScore = value ?? 0;

  return (
    <div
      className={cn('flex items-center gap-3', className)}
      data-testid={testId}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1 min-w-[120px]">
              <Slider
                value={[displayScore]}
                onValueChange={values => onChange(values[0] ?? 0)}
                min={0}
                max={5}
                step={0.5}
                disabled={disabled}
                aria-label="Nota de 0 a 5"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            {formatScore(value)} — {getDescriptionFor(value)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!hideStars && (
        <StarRow score={displayScore} starColorClass={starColorClass} />
      )}

      {!hideNumber && (
        <span
          className={cn(
            'text-xs font-medium tabular-nums shrink-0 min-w-[2.5ch] text-right',
            value === null
              ? 'text-muted-foreground'
              : 'text-foreground'
          )}
        >
          {formatScore(value)}
        </span>
      )}
    </div>
  );
}

/**
 * Versao readonly: somente estrelas + numero, sem slider.
 * Util para tabelas/listagens.
 */
export function ScoreStars({
  value,
  starColorClass = 'text-amber-400',
  showNumber = true,
  className,
}: {
  value: number | null;
  starColorClass?: string;
  showNumber?: boolean;
  className?: string;
}) {
  if (value === null) {
    return (
      <span className={cn('text-xs text-muted-foreground italic', className)}>
        Nao avaliado
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <StarRow score={value} starColorClass={starColorClass} />
      {showNumber && (
        <span className="text-xs font-medium tabular-nums text-foreground">
          {formatScore(value)}
        </span>
      )}
    </div>
  );
}
