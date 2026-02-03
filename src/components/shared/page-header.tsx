'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  gradient: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  gradient,
  showBackButton = true,
  actions,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'backdrop-blur-xl bg-white/80 dark:bg-white/5',
        'border-b border-gray-200 dark:border-white/10',
        'px-8 py-6 sticky top-20 z-10',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => router.back()}
              className="w-14 h-14 rounded-2xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {/* Icon Container */}
          <div
            className={cn(
              'w-14 h-14 rounded-2xl',
              `bg-linear-to-br ${gradient}`,
              'flex items-center justify-center shadow-2xl'
            )}
          >
            <div className="w-7 h-7 text-white">{icon}</div>
          </div>

          {/* Text */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 dark:text-white/60">{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
