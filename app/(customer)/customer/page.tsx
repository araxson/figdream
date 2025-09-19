import { CustomerDashboard } from '@/core/customer/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Dashboard',
  description: 'Manage your appointments and profile',
};

export default function CustomerDashboardPage() {
  return <CustomerDashboard />;
}