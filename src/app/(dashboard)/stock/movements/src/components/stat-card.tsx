'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  subValue?: string;
  icon: LucideIcon;
  className?: string;
  iconClass?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  className,
  iconClass,
}: StatCardProps) {
  return (
    <Card className={cn('border', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subValue && (
              <p className="text-xs text-muted-foreground">{subValue}</p>
            )}
          </div>
          <Icon className={cn('h-8 w-8 opacity-50', iconClass)} />
        </div>
      </CardContent>
    </Card>
  );
}
