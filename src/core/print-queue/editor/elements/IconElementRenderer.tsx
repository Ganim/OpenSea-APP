'use client';

/**
 * Label Studio - Icon Element Renderer
 * Renderiza elementos de ícone
 */

import React from 'react';
import type { IconElement } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface IconElementRendererProps {
  element: IconElement;
  zoom: number;
}

/**
 * Mapa de categorias para ícones disponíveis
 */
export const ICON_CATEGORIES = {
  general: ['Check', 'X', 'Plus', 'Minus', 'Star', 'Heart', 'Flag', 'Bell'],
  arrows: [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ChevronUp',
    'ChevronDown',
    'ChevronLeft',
    'ChevronRight',
  ],
  status: [
    'CheckCircle',
    'XCircle',
    'AlertCircle',
    'Info',
    'AlertTriangle',
    'Ban',
    'Clock',
    'Timer',
  ],
  commerce: [
    'ShoppingCart',
    'Package',
    'Truck',
    'CreditCard',
    'DollarSign',
    'Percent',
    'Tag',
    'Barcode',
  ],
  warehouse: [
    'Box',
    'Archive',
    'Warehouse',
    'Layers',
    'Grid3x3',
    'LayoutGrid',
    'MapPin',
    'Navigation',
  ],
  actions: [
    'Edit',
    'Trash2',
    'Copy',
    'Save',
    'Download',
    'Upload',
    'Printer',
    'QrCode',
  ],
  misc: [
    'User',
    'Users',
    'Building',
    'Calendar',
    'Mail',
    'Phone',
    'Globe',
    'Link',
  ],
} as const;

/**
 * Obtém o componente de ícone pelo nome
 */
function getIconComponent(iconId: string): LucideIcon | null {
  // Tenta encontrar o ícone no lucide-react
  const icons = LucideIcons as unknown as Record<
    string,
    LucideIcon | undefined
  >;
  const IconComponent = icons[iconId];
  return IconComponent || null;
}

/**
 * Renderiza um ícone Lucide pelo ID, sem criar componente durante render
 */
function LucideIconById({
  iconId,
  sizePx,
}: {
  iconId: string;
  sizePx: number;
}) {
  const Icon = getIconComponent(iconId);
  if (!Icon) return null;
  return React.createElement(Icon, {
    style: { width: sizePx * 0.9, height: sizePx * 0.9 },
  });
}

/**
 * Renderiza elemento de ícone
 */
export function IconElementRenderer({
  element,
  zoom,
}: IconElementRendererProps) {
  const { iconId, color, width, height } = element;

  const hasIcon = !!getIconComponent(iconId);

  // Calcula tamanho do ícone (usa o menor entre width e height)
  const sizePx = Math.min(mmToPx(width, zoom), mmToPx(height, zoom));

  if (!hasIcon) {
    // Fallback para ícone não encontrado
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ color }}
      >
        <svg
          width={sizePx}
          height={sizePx}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ color }}
    >
      <LucideIconById iconId={iconId} sizePx={sizePx} />
    </div>
  );
}

/**
 * Lista todos os ícones disponíveis por categoria
 */
export function getAvailableIcons(): Record<string, readonly string[]> {
  return ICON_CATEGORIES;
}

/**
 * Busca ícones pelo nome
 */
export function searchIcons(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const results: string[] = [];

  for (const icons of Object.values(ICON_CATEGORIES)) {
    for (const icon of icons) {
      if (icon.toLowerCase().includes(normalizedQuery)) {
        results.push(icon);
      }
    }
  }

  return results;
}

export default IconElementRenderer;
