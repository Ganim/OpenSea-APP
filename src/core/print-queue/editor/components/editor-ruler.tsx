/**
 * Editor Ruler Component
 * Réguas horizontal e vertical estilo Photoshop para o editor de etiquetas
 */

'use client';

import { cn } from '@/lib/utils';
import { memo, useMemo } from 'react';

interface RulerProps {
  /** Orientação da régua */
  orientation: 'horizontal' | 'vertical';
  /** Tamanho total em pixels */
  size: number;
  /** Zoom atual (ex: 100, 200, etc) */
  zoom: number;
  /** Offset de scroll */
  scrollOffset?: number;
  /** Tamanho em mm */
  sizeInMm: number;
  /** Conversão mm para px */
  mmToPx: number;
}

// Constantes para a régua
const RULER_SIZE = 20; // Largura/altura da régua em px
const MAJOR_TICK_INTERVAL = 10; // Marcação maior a cada 10mm
const MINOR_TICK_INTERVAL = 5; // Marcação média a cada 5mm
const MICRO_TICK_INTERVAL = 1; // Marcação pequena a cada 1mm

/**
 * Componente de régua individual
 */
export const EditorRuler = memo(function EditorRuler({
  orientation,
  size,
  zoom,
  scrollOffset = 0,
  sizeInMm,
  mmToPx,
}: RulerProps) {
  const scale = zoom / 100;
  const scaledMmToPx = mmToPx * scale;

  // Gerar marcações da régua
  const ticks = useMemo(() => {
    const ticksArray: Array<{
      position: number;
      label?: string;
      type: 'major' | 'minor' | 'micro';
    }> = [];

    // Calcular quantos mm cabem no tamanho
    const totalMm = Math.ceil(sizeInMm) + 5; // Adicionar margem

    for (let mm = 0; mm <= totalMm; mm++) {
      const position = mm * scaledMmToPx;

      if (mm % MAJOR_TICK_INTERVAL === 0) {
        ticksArray.push({
          position,
          label: String(mm),
          type: 'major',
        });
      } else if (mm % MINOR_TICK_INTERVAL === 0) {
        ticksArray.push({
          position,
          type: 'minor',
        });
      } else if (mm % MICRO_TICK_INTERVAL === 0 && scale >= 1.5) {
        // Só mostrar micro ticks em zoom alto
        ticksArray.push({
          position,
          type: 'micro',
        });
      }
    }

    return ticksArray;
  }, [sizeInMm, scaledMmToPx, scale]);

  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={cn(
        'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 select-none overflow-hidden',
        isHorizontal
          ? 'h-5 border-b flex-shrink-0'
          : 'w-5 border-r flex-shrink-0'
      )}
      style={{
        [isHorizontal ? 'width' : 'height']: size,
      }}
    >
      <svg
        width={isHorizontal ? size : RULER_SIZE}
        height={isHorizontal ? RULER_SIZE : size}
        className="text-slate-500 dark:text-slate-400"
      >
        {ticks.map((tick, index) => {
          const tickLength =
            tick.type === 'major' ? 12 : tick.type === 'minor' ? 8 : 4;
          const strokeWidth = tick.type === 'major' ? 1 : 0.5;

          if (isHorizontal) {
            return (
              <g key={index}>
                <line
                  x1={tick.position}
                  y1={RULER_SIZE - tickLength}
                  x2={tick.position}
                  y2={RULER_SIZE}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                />
                {tick.label && (
                  <text
                    x={tick.position + 2}
                    y={10}
                    fontSize="9"
                    fill="currentColor"
                    className="font-mono"
                  >
                    {tick.label}
                  </text>
                )}
              </g>
            );
          } else {
            return (
              <g key={index}>
                <line
                  x1={RULER_SIZE - tickLength}
                  y1={tick.position}
                  x2={RULER_SIZE}
                  y2={tick.position}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                />
                {tick.label && (
                  <text
                    x={2}
                    y={tick.position + 3}
                    fontSize="9"
                    fill="currentColor"
                    className="font-mono"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                    }}
                  >
                    {tick.label}
                  </text>
                )}
              </g>
            );
          }
        })}
      </svg>
    </div>
  );
});

/**
 * Canto da régua (interseção)
 */
export const RulerCorner = memo(function RulerCorner() {
  return (
    <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
      <span className="text-[8px] text-slate-400 font-mono">mm</span>
    </div>
  );
});

export default EditorRuler;
