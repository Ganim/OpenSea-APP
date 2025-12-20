import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-(--transition-fast) border',
  {
    variants: {
      variant: {
        default:
          'bg-(--badge-default-bg) text-(--badge-default-text) border-(--badge-default-border)',
        secondary:
          'bg-(--badge-secondary-bg) text-(--badge-secondary-text) border-(--badge-secondary-border)',
        destructive:
          'bg-(--badge-destructive-bg) text-(--badge-destructive-text) border-(--badge-destructive-border)',
        success:
          'bg-(--badge-success-bg) text-(--badge-success-text) border-(--badge-success-border)',
        warning:
          'bg-(--badge-warning-bg) text-(--badge-warning-text) border-(--badge-warning-border)',
        outline:
          'bg-(--badge-outline-bg) text-(--badge-outline-text) border-(--badge-outline-border)',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
