import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  className?: string;
  iconClass?: string;
  isMonetary?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  className,
  iconClass,
  isMonetary,
}: StatCardProps) {
  return (
    <Card className={cn('border', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn('font-bold', isMonetary ? 'text-lg' : 'text-2xl')}>
              {value}
            </p>
          </div>
          <Icon className={cn('h-8 w-8 opacity-50', iconClass)} />
        </div>
      </CardContent>
    </Card>
  );
}
