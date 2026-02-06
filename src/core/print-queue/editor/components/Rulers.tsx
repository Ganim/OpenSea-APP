'use client';

/**
 * Label Studio - Rulers Component
 * Réguas horizontais e verticais em milímetros
 */

import React, { useMemo } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { mmToPx } from '../utils/unitConverter';
import { cn } from '@/lib/utils';

interface RulersProps {
  className?: string;
}

const RULER_SIZE = 20; // pixels
const MAJOR_TICK_INTERVAL = 10; // mm
const MINOR_TICK_INTERVAL = 5; // mm

/**
 * Componente de Réguas do Label Studio
 */
export function Rulers({ className }: RulersProps) {
  const canvasWidth = useEditorStore((s) => s.canvasWidth);
  const canvasHeight = useEditorStore((s) => s.canvasHeight);
  const zoom = useEditorStore((s) => s.zoom);
  const panOffset = useEditorStore((s) => s.panOffset);
  const showRulers = useEditorStore((s) => s.showRulers);

  // Generate tick marks for horizontal ruler
  const horizontalTicks = useMemo(() => {
    if (!showRulers) return [];

    const ticks: { position: number; label?: string; isMajor: boolean }[] = [];
    const totalMm = canvasWidth;

    for (let mm = 0; mm <= totalMm; mm += MINOR_TICK_INTERVAL) {
      const isMajor = mm % MAJOR_TICK_INTERVAL === 0;
      ticks.push({
        position: mmToPx(mm, zoom),
        label: isMajor ? String(mm) : undefined,
        isMajor,
      });
    }

    return ticks;
  }, [canvasWidth, zoom, showRulers]);

  // Generate tick marks for vertical ruler
  const verticalTicks = useMemo(() => {
    if (!showRulers) return [];

    const ticks: { position: number; label?: string; isMajor: boolean }[] = [];
    const totalMm = canvasHeight;

    for (let mm = 0; mm <= totalMm; mm += MINOR_TICK_INTERVAL) {
      const isMajor = mm % MAJOR_TICK_INTERVAL === 0;
      ticks.push({
        position: mmToPx(mm, zoom),
        label: isMajor ? String(mm) : undefined,
        isMajor,
      });
    }

    return ticks;
  }, [canvasHeight, zoom, showRulers]);

  if (!showRulers) return null;

  // Calculate ruler offset based on pan
  const canvasWidthPx = mmToPx(canvasWidth, zoom);
  const canvasHeightPx = mmToPx(canvasHeight, zoom);

  return (
    <>
      {/* Corner square */}
      <div
        className={cn(
          'absolute top-0 left-0 bg-neutral-100 dark:bg-neutral-800 border-r border-b border-neutral-300 dark:border-neutral-600 z-20',
          className
        )}
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
      >
        <span className="text-[8px] text-neutral-400 flex items-center justify-center h-full">
          mm
        </span>
      </div>

      {/* Horizontal ruler */}
      <div
        className="absolute top-0 left-0 h-5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-600 overflow-hidden z-10"
        style={{
          left: RULER_SIZE,
          right: 0,
          height: RULER_SIZE,
        }}
      >
        <div
          className="relative h-full"
          style={{
            width: canvasWidthPx,
            transform: `translateX(${panOffset.x + (typeof window !== 'undefined' ? window.innerWidth / 2 - RULER_SIZE : 0) - canvasWidthPx / 2}px)`,
          }}
        >
          {horizontalTicks.map((tick, index) => (
            <div
              key={index}
              className="absolute bottom-0"
              style={{ left: tick.position }}
            >
              <div
                className={cn(
                  'w-px bg-neutral-400 dark:bg-neutral-500',
                  tick.isMajor ? 'h-3' : 'h-1.5'
                )}
              />
              {tick.label && (
                <span
                  className="absolute text-[9px] text-neutral-500 dark:text-neutral-400"
                  style={{
                    left: 2,
                    top: 0,
                  }}
                >
                  {tick.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vertical ruler */}
      <div
        className="absolute top-0 left-0 w-5 bg-neutral-100 dark:bg-neutral-800 border-r border-neutral-300 dark:border-neutral-600 overflow-hidden z-10"
        style={{
          top: RULER_SIZE,
          bottom: 0,
          width: RULER_SIZE,
        }}
      >
        <div
          className="relative w-full"
          style={{
            height: canvasHeightPx,
            transform: `translateY(${panOffset.y + (typeof window !== 'undefined' ? window.innerHeight / 2 - RULER_SIZE : 0) - canvasHeightPx / 2}px)`,
          }}
        >
          {verticalTicks.map((tick, index) => (
            <div
              key={index}
              className="absolute right-0"
              style={{ top: tick.position }}
            >
              <div
                className={cn(
                  'h-px bg-neutral-400 dark:bg-neutral-500',
                  tick.isMajor ? 'w-3' : 'w-1.5'
                )}
              />
              {tick.label && (
                <span
                  className="absolute text-[9px] text-neutral-500 dark:text-neutral-400"
                  style={{
                    left: 1,
                    top: 2,
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {tick.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Rulers;
