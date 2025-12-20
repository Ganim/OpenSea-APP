'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'bg-(--tabs-list-bg) text-[rgb(var(--color-foreground-muted))] inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] backdrop-blur-sm',
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'data-[state=active]:bg-(--tabs-trigger-active-bg) data-[state=active]:text-[rgb(var(--color-foreground))]',
        'focus-visible:border-[rgb(var(--color-ring))] focus-visible:ring-[rgb(var(--color-ring)/0.5)] focus-visible:outline-[rgb(var(--color-ring))]',
        'text-[rgb(var(--color-foreground))] dark:text-[rgb(var(--color-foreground-muted))]',
        'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap',
        'transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1',
        'disabled:pointer-events-none disabled:opacity-(--state-disabled-opacity)',
        'data-[state=active]:shadow-sm cursor-pointer hover:bg-(--tabs-trigger-hover)',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
