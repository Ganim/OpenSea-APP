'use client';

import { useCentralTheme } from '@/contexts/central-theme-context';
import { useState } from 'react';

/**
 * Background animado com gradientes e esferas flutuantes
 * Inspirado em dashboards modernos com glassmorphism
 */
export function AnimatedBackground() {
  const [mounted] = useState(typeof window !== 'undefined');
  const { theme } = useCentralTheme();

  if (!mounted) return null;

  const isDark = theme === 'dark-blue';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradiente base - muda com o tema */}
      <div
        className={
          isDark
            ? 'absolute inset-0 bg-linear-to-br from-slate-900 via-blue-900 to-slate-900'
            : 'absolute inset-0 bg-linear-to-br from-gray-100 via-gray-200 to-gray-100'
        }
      />

      {/* Gradiente overlay */}
      <div
        className={
          isDark
            ? 'absolute inset-0 bg-linear-to-tr from-blue-900/20 via-transparent to-slate-800/20'
            : 'absolute inset-0 bg-linear-to-tr from-gray-300/10 via-transparent to-gray-400/10'
        }
      />

      {/* Esfera 1 - Top Left */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30 blur-3xl animate-pulse"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0) 70%)'
            : 'radial-gradient(circle, rgba(148, 163, 184, 0.4) 0%, rgba(148, 163, 184, 0) 70%)',
          animationDuration: '8s',
        }}
      />

      {/* Esfera 2 - Top Right */}
      <div
        className="absolute -top-20 -right-32 w-80 h-80 rounded-full opacity-25 blur-3xl animate-pulse"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.7) 0%, rgba(168, 85, 247, 0) 70%)'
            : 'radial-gradient(circle, rgba(120, 113, 108, 0.3) 0%, rgba(120, 113, 108, 0) 70%)',
          animationDuration: '10s',
          animationDelay: '1s',
        }}
      />

      {/* Esfera 3 - Center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-pulse"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(236, 72, 153, 0) 70%)'
            : 'radial-gradient(circle, rgba(107, 114, 128, 0.25) 0%, rgba(107, 114, 128, 0) 70%)',
          animationDuration: '12s',
          animationDelay: '2s',
        }}
      />

      {/* Esfera 4 - Bottom Left */}
      <div
        className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full opacity-30 blur-3xl animate-pulse"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(34, 211, 238, 0.7) 0%, rgba(34, 211, 238, 0) 70%)'
            : 'radial-gradient(circle, rgba(156, 163, 175, 0.35) 0%, rgba(156, 163, 175, 0) 70%)',
          animationDuration: '9s',
          animationDelay: '3s',
        }}
      />

      {/* Esfera 5 - Bottom Right */}
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-25 blur-3xl animate-pulse"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, rgba(251, 191, 36, 0) 70%)'
            : 'radial-gradient(circle, rgba(209, 213, 219, 0.3) 0%, rgba(209, 213, 219, 0) 70%)',
          animationDuration: '11s',
          animationDelay: '4s',
        }}
      />

      {/* Grid pattern overlay sutil */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}
