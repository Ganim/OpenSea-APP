'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-2xl backdrop-blur-xl bg-white/5 dark:bg-white/5 border border-white/10"
          aria-label="Alternar tema"
        >
          <div className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="fixed top-6 right-6 z-50">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="rounded-2xl backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Alternar tema"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
        <span className="sr-only">Alternar tema</span>
      </Button>
    </div>
  );
}
