import { Metadata } from 'next';
import { StaffServicesManager } from '@/components/features/staff/staff-services-manager';

export const metadata: Metadata = {
  title: 'Staff Services | Dashboard',
  description: 'Manage which services staff members can perform',
};

export default function StaffServicesPage() {
  return <StaffServicesManager />;
}