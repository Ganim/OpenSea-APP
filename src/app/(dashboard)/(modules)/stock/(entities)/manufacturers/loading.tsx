import { Skeleton } from '@/components/ui/skeleton';

export default function ManufacturersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-9 w-64" />
      </div>
    </div>
  );
}
