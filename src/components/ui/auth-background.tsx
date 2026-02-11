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

      {/* Static background spheres (no blur, no animate-pulse) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, rgb(var(--sphere-1) / var(--sphere-1-opacity)) 0%, transparent 70%)`,
          }}
        />

        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, rgb(var(--sphere-2) / var(--sphere-2-opacity)) 0%, transparent 70%)`,
          }}
        />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, rgb(var(--sphere-3) / var(--sphere-3-opacity)) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
