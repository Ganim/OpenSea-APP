'use client';

import { cn } from '@/lib/utils';
import type {
  PageBodyProps,
  PageHeaderProps,
  PageLayoutProps,
} from './types/page-layout.types';

export function PageLayout({
  children,
  spacing = 'gap-6',
  backgroundVariant: _bg,
  maxWidth: _mw,
  className,
}: PageLayoutProps) {
  return (
    <div
      id="page"
      className={cn(
        // Container
        'w-full',
        'mx-auto',

        // Spacing
        `space-y-${spacing.replace('gap-', '')}`,
        spacing,
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  children,
  spacing = 'gap-4',
  className,
}: PageHeaderProps) {
  return (
    <div
      id="page-header"
      className={cn(
        // Container
        'flex flex-col',
        'w-full',
        'mx-auto',
        // Spacing
        `space-y-${spacing.replace('gap-', '')}`,
        spacing,
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageBody({
  children,
  spacing = 'gap-4',
  className,
}: PageBodyProps) {
  return (
    <div
      id="page-body"
      className={cn(
        // Container
        'w-full',
        'mx-auto',
        // Spacing
        `space-y-${spacing.replace('gap-', '')}`,
        spacing,
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}
