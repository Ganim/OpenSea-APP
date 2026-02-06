'use client';

/**
 * Label Studio - Image Element Renderer
 * Renderiza elementos de imagem
 */

import React, { useState } from 'react';
import type { ImageElement } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';
import { ImageIcon } from 'lucide-react';

interface ImageElementRendererProps {
  element: ImageElement;
  zoom: number;
}

/**
 * Renderiza elemento de imagem
 */
export function ImageElementRenderer({
  element,
  zoom,
}: ImageElementRendererProps) {
  const { src, alt, objectFit, borderRadius, width, height } = element;
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!src);

  const borderRadiusPx = borderRadius ? mmToPx(borderRadius, zoom) : 0;

  // Placeholder quando não há imagem ou erro
  if (!src || hasError) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
        style={{
          borderRadius: borderRadiusPx,
        }}
      >
        <ImageIcon className="w-1/3 h-1/3 max-w-8 max-h-8" />
        <span
          className="text-center mt-1"
          style={{ fontSize: mmToPx(2, zoom) }}
        >
          {hasError ? 'Erro ao carregar' : 'Sem imagem'}
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        borderRadius: borderRadiusPx,
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Imagem */}
      <img
        src={src}
        alt={alt || ''}
        className="w-full h-full"
        style={{
          objectFit,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.2s',
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        draggable={false}
      />
    </div>
  );
}

export default ImageElementRenderer;
