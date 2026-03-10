'use client';

import type { Pattern } from '@/types/stock';

interface PatternDisplayProps {
  pattern: string;
  colorHex?: string;
  secondaryColorHex?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 48,
} as const;

function getPatternStyle(
  pattern: string,
  color1: string,
  color2: string
): React.CSSProperties {
  switch (pattern as Pattern) {
    case 'SOLID':
      return { backgroundColor: color1 };
    case 'STRIPED':
      return {
        background: `repeating-linear-gradient(0deg, ${color1}, ${color1} 4px, ${color2} 4px, ${color2} 8px)`,
      };
    case 'PLAID':
      return {
        background: [
          `repeating-linear-gradient(0deg, ${color1}80, ${color1}80 4px, transparent 4px, transparent 8px)`,
          `repeating-linear-gradient(90deg, ${color2}80, ${color2}80 4px, transparent 4px, transparent 8px)`,
          color1,
        ].join(', '),
      };
    case 'PRINTED':
      return {
        background: [
          `radial-gradient(circle 2px at 25% 25%, ${color2} 100%, transparent 100%)`,
          `radial-gradient(circle 2px at 75% 75%, ${color2} 100%, transparent 100%)`,
          `radial-gradient(circle 1.5px at 50% 10%, ${color2} 100%, transparent 100%)`,
          `radial-gradient(circle 1.5px at 10% 60%, ${color2} 100%, transparent 100%)`,
          `radial-gradient(circle 1.5px at 85% 40%, ${color2} 100%, transparent 100%)`,
          color1,
        ].join(', '),
      };
    case 'GRADIENT':
      return {
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
      };
    case 'JACQUARD':
      return {
        backgroundImage: [
          `linear-gradient(45deg, ${color2} 25%, transparent 25%)`,
          `linear-gradient(-45deg, ${color2} 25%, transparent 25%)`,
          `linear-gradient(45deg, transparent 75%, ${color2} 75%)`,
          `linear-gradient(-45deg, transparent 75%, ${color2} 75%)`,
        ].join(', '),
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        backgroundColor: color1,
      };
    default:
      return { backgroundColor: color1 };
  }
}

/**
 * Exibe um preview visual do padrão de uma variante usando gradientes CSS
 */
export function PatternDisplay({
  pattern,
  colorHex = '#6366f1',
  secondaryColorHex = '#d1d5db',
  size = 'md',
}: PatternDisplayProps) {
  const px = SIZE_MAP[size];
  const style = getPatternStyle(pattern, colorHex, secondaryColorHex);

  return (
    <div
      className="rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 shrink-0"
      style={{ width: px, height: px, ...style }}
      title={pattern}
    />
  );
}
