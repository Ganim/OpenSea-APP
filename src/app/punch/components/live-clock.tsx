'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-4">
        <Clock className="size-5 text-slate-400 shrink-0" />
        <div className="space-y-1">
          <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-4 py-4">
      <Clock className="size-5 text-violet-600 dark:text-violet-400 shrink-0" />
      <div>
        <p className="text-2xl font-bold tabular-nums text-violet-900 dark:text-violet-100 tracking-tight">
          {formatTime(now)}
        </p>
        <p className="text-sm text-violet-600/80 dark:text-violet-400/80">
          {capitalizeFirst(formatDate(now))}
        </p>
      </div>
    </div>
  );
}
