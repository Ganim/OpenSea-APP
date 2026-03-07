'use client';

import React, { memo } from 'react';

interface GridOverlayProps {
  width: number;
  height: number;
  gridSize: number;
  visible: boolean;
}

export const GridOverlay = memo(function GridOverlay({
  width,
  height,
  gridSize,
  visible,
}: GridOverlayProps) {
  if (!visible) return null;

  const verticalLines = Math.ceil(width / gridSize);
  const horizontalLines = Math.ceil(height / gridSize);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ zIndex: 0 }}
    >
      <defs>
        <pattern
          id="grid"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-200 dark:text-gray-700"
          />
        </pattern>
        <pattern
          id="grid-major"
          width={gridSize * 5}
          height={gridSize * 5}
          patternUnits="userSpaceOnUse"
        >
          <rect width={gridSize * 5} height={gridSize * 5} fill="url(#grid)" />
          <path
            d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-300 dark:text-gray-600"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-major)" />
    </svg>
  );
});
