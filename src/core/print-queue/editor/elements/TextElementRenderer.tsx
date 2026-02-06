'use client';

/**
 * Label Studio - Text Element Renderer
 * Renderiza elementos de texto estático
 */

import React from 'react';
import type { TextElement } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';

interface TextElementRendererProps {
  element: TextElement;
  zoom: number;
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
}

/**
 * Renderiza elemento de texto
 */
export function TextElementRenderer({
  element,
  zoom,
  isEditing = false,
  onContentChange,
}: TextElementRendererProps) {
  const { style, content } = element;

  // Calcula font size em pixels
  const fontSizePx = mmToPx(style.fontSize, zoom);

  const textStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: fontSizePx,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    color: style.color,
    backgroundColor: style.backgroundColor,
    textAlign: style.textAlign,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    display: 'flex',
    alignItems:
      style.verticalAlign === 'top'
        ? 'flex-start'
        : style.verticalAlign === 'bottom'
          ? 'flex-end'
          : 'center',
    padding: mmToPx(0.5, zoom), // 0.5mm padding interno
  };

  if (isEditing) {
    return (
      <textarea
        className="w-full h-full resize-none border-none outline-none"
        style={{
          ...textStyle,
          background: 'transparent',
        }}
        value={content}
        onChange={e => onContentChange?.(e.target.value)}
        autoFocus
      />
    );
  }

  return (
    <div style={textStyle}>
      <span>{content || 'Texto'}</span>
    </div>
  );
}

export default TextElementRenderer;
