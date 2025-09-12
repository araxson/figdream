import { Metadata } from 'next';
import { StaffSpecialtiesManager } from '@/components/features/staff/staff-specialties-manager';

export const metadata: Metadata = {
  title: 'Staff Specialties | Dashboard',
  description: 'Manage staff skills and specializations',
};

export default function StaffSpecialtiesPage() {
  return <StaffSpecialtiesManager />;
}