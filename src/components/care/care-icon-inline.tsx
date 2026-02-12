'use client';

/**
 * CareIconInline - Renders care SVG icons inline for CSS color support.
 * Fetches the SVG text and injects via dangerouslySetInnerHTML so that
 * `currentColor` in the SVG responds to the wrapper's CSS `color` property.
 */

import { useEffect, useState } from 'react';

interface CareIconInlineProps {
  code: string;
  size?: number;
  color?: string;
  className?: string;
}

// Simple in-memory cache to avoid re-fetching the same SVG
const svgCache = new Map<string, string>();

export function CareIconInline({
  code,
  size = 24,
  color = '#000000',
  className,
}: CareIconInlineProps) {
  const [svgContent, setSvgContent] = useState<string | null>(
    () => svgCache.get(code) ?? null
  );

  useEffect(() => {
    if (svgCache.has(code)) {
      setSvgContent(svgCache.get(code)!);
      return;
    }

    let cancelled = false;
    const url = `/assets/care/iso3758/${code}.svg`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        return res.text();
      })
      .then(text => {
        svgCache.set(code, text);
        if (!cancelled) setSvgContent(text);
      })
      .catch(() => {
        if (!cancelled) setSvgContent(null);
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!svgContent) {
    return (
      <div className={className} style={{ width: size, height: size, color }} />
    );
  }

  return (
    <div
      className={className}
      style={{ width: size, height: size, color }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
