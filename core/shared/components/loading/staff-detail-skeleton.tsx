import { Skeleton } from '@/components/ui/skeleton';

export function StaffDetailSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  );
}