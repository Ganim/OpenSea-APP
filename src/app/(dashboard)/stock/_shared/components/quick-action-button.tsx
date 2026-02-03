'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'entry' | 'exit' | 'transfer' | 'scan' | 'inventory';
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-secondary hover:bg-secondary/80',
  entry: 'bg-green-500 hover:bg-green-600 text-white',
  exit: 'bg-red-500 hover:bg-red-600 text-white',
  transfer: 'bg-blue-500 hover:bg-blue-600 text-white',
  scan: 'bg-purple-500 hover:bg-purple-600 text-white',
  inventory: 'bg-orange-500 hover:bg-orange-600 text-white',
};

export function QuickActionButton({
  label,
  icon: Icon,
  href,
  onClick,
  variant = 'default',
  disabled,
  className,
}: QuickActionButtonProps) {
  const buttonContent = (
    <div className="flex flex-col items-center gap-2 py-2">
      <Icon className="h-6 w-6" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  const buttonClassName = cn(
    'h-auto min-h-[80px] w-full flex-col',
    variantStyles[variant],
    className
  );

  if (href) {
    return (
      <Button
        asChild
        variant="ghost"
        className={buttonClassName}
        disabled={disabled}
      >
        <Link href={href}>{buttonContent}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {buttonContent}
    </Button>
  );
}

// ============================================
// QUICK ACTIONS GRID
// ============================================

interface QuickActionsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function QuickActionsGrid({
  children,
  columns = 4,
  className,
}: QuickActionsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-3', gridCols[columns], className)}>
      {children}
    </div>
  );
}
