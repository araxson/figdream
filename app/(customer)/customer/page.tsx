import { CustomerDashboardWrapper } from '@/core/customer/components/dashboard/customer-dashboard-wrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Dashboard',
  description: 'Manage your appointments and profile',
};

export default function CustomerDashboardPage() {
  return <CustomerDashboardWrapper />;
}