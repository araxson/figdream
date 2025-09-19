import { Suspense } from 'react';
import { ScheduleManager } from '@/core/staff';
import { Skeleton } from '@/components/ui/skeleton';

async function StaffScheduleContent() {
  // This would typically get the current staff member's ID from auth
  const staffId = 'current-staff-id'; // Replace with actual auth logic

  return <ScheduleManager staffId={staffId} />;
}

export default function StaffSchedulePage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-96" />
        </div>
      }>
        <StaffScheduleContent />
      </Suspense>
    </div>
  );
}
