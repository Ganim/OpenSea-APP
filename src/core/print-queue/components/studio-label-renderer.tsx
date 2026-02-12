/**
 * Studio Label Renderer
 * Renderiza um template do Label Studio de forma standalone,
 * sem depender do Zustand editor store.
 * Usado no preview da fila de impressão e na geração de PDF.
 */

'use client';

import type { LabelStudioTemplate } from '@/core/print-queue/editor';
import { ElementRenderer, mmToPx } from '@/core/print-queue/editor';

interface StudioLabelRendererProps {
  template: LabelStudioTemplate;
  previewData?: Record<string, unknown>;
  scale?: number;
  className?: string;
  showBorder?: boolean;
}

export function StudioLabelRenderer({
  template,
  previewData,
  scale = 1,
  className,
  showBorder = false,
}: StudioLabelRendererProps) {
  const widthPx = mmToPx(template.width, scale);
  const heightPx = mmToPx(template.height, scale);

  const visibleElements = template.elements
    .filter(el => el.visible !== false)
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className={className}
      style={{
        width: widthPx,
        height: heightPx,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: template.canvas?.backgroundColor || '#ffffff',
        border: showBorder ? '1px solid #d1d5db' : undefined,
        borderRadius: showBorder ? 2 : undefined,
        boxShadow: showBorder ? '0 1px 3px rgba(0,0,0,0.1)' : undefined,
      }}
    >
      {visibleElements.map(element => (
        <div
          key={element.id}
          style={{
            position: 'absolute',
            left: mmToPx(element.x, scale),
            top: mmToPx(element.y, scale),
            width: mmToPx(element.width, scale),
            height: mmToPx(element.height, scale),
            transform: element.rotation
              ? `rotate(${element.rotation}deg)`
              : undefined,
            opacity: element.opacity ?? 1,
            overflow: 'hidden',
          }}
        >
          <ElementRenderer
            element={element}
            zoom={scale}
            previewData={previewData}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Tenta parsear grapesJsData como LabelStudioTemplate (v2)
 * Retorna null se não for v2 ou se o parse falhar
 */
export function parseStudioTemplate(
  grapesJsData: string | undefined | null
): LabelStudioTemplate | null {
  if (!grapesJsData) return null;

  try {
    const parsed = JSON.parse(grapesJsData);
    if (parsed && parsed.version === 2 && Array.isArray(parsed.elements)) {
      return parsed as LabelStudioTemplate;
    }
    return null;
  } catch {
    return null;
  }
}
