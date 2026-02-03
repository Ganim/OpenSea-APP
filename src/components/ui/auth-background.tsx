'use client';

import { ReactNode } from 'react';

interface AuthBackgroundProps {
  children: ReactNode;
}

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradiente usando CSS variables */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, rgb(var(--bg-from)), rgb(var(--bg-via)), rgb(var(--bg-to)))`,
        }}
      />

      {/* Animated background spheres */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Esfera superior direita - Azul */}
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
          style={{
            backgroundColor: `rgb(var(--sphere-1) / var(--sphere-1-opacity))`,
          }}
        />

        {/* Esfera inferior esquerda - Roxo */}
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
          style={{
            backgroundColor: `rgb(var(--sphere-2) / var(--sphere-2-opacity))`,
            animationDelay: '1000ms',
          }}
        />

        {/* Esfera central - Azul claro */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor: `rgb(var(--sphere-3) / var(--sphere-3-opacity))`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
