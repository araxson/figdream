import { StaffDashboard } from '@/core/staff/components/staff-dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Dashboard',
  description: 'Manage your appointments and schedule',
};

export default function StaffDashboardPage() {
  return <StaffDashboard />;
}