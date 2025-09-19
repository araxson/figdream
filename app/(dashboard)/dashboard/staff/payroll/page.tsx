import { Suspense } from 'react';
import { PayrollManager } from '@/core/staff';
import { Skeleton } from '@/components/ui/skeleton';

function PayrollPageContent() {
  // This would typically get payroll data for the salon
  return <PayrollManager />;
}

export default function StaffPayrollPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      }>
        <PayrollPageContent />
      </Suspense>
    </div>
  );
}