import { Metadata } from 'next';
import { StaffSchedulesManager } from '@/components/features/staff/staff-schedules-manager';

export const metadata: Metadata = {
  title: 'Staff Schedules | Dashboard',
  description: 'Manage staff working hours and availability',
};

export default function StaffSchedulesPage() {
  return <StaffSchedulesManager />;
}