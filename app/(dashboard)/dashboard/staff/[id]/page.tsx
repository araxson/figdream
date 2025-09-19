import { Suspense } from 'react';
import { StaffDetailPage } from '@/core/staff/components/staff-detail-page';
import { StaffDetailSkeleton } from '@/core/shared/components/loading/staff-detail-skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<StaffDetailSkeleton />}>
      <StaffDetailPage staffId={id} />
    </Suspense>
  );
}