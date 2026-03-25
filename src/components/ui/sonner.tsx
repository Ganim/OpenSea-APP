'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium',
          title: 'text-sm font-semibold',
          description: 'text-xs opacity-90',
          success:
            'bg-gradient-to-r from-emerald-600 to-emerald-700 border-emerald-500/50 text-white',
          error:
            'bg-gradient-to-r from-rose-600 to-rose-700 border-rose-500/50 text-white',
          warning:
            'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500/50 text-white',
          info: 'bg-gradient-to-r from-sky-600 to-sky-700 border-sky-500/50 text-white',
          default:
            'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-600/50 text-white',
          actionButton:
            'bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-2.5 py-1 rounded-lg transition-colors',
          cancelButton:
            'bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1 rounded-lg transition-colors',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
