'use client';

import { useCentralTheme } from '@/contexts/central-theme-context';

/**
 * Background com gradientes estaticos para a area Central.
 * Sem blur-3xl, sem animate-pulse — performance otimizada.
 */
export function AnimatedBackground() {
  const { theme } = useCentralTheme();

  const isDark = theme === 'dark-blue';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradiente base */}
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

      {/* Manchas decorativas estaticas (radial-gradient, sem blur) */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(148, 163, 184, 0.2) 0%, transparent 70%)',
        }}
      />

      <div
        className="absolute -top-20 -right-32 w-80 h-80 rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(120, 113, 108, 0.15) 0%, transparent 70%)',
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(107, 114, 128, 0.12) 0%, transparent 70%)',
        }}
      />

      <div
        className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(156, 163, 175, 0.18) 0%, transparent 70%)',
        }}
      />

      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(209, 213, 219, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
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
