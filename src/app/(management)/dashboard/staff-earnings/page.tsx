import { Metadata } from 'next';
import { StaffEarningsClient } from './client';

export const metadata: Metadata = {
  title: 'Staff Earnings | Dashboard',
  description: 'Track and manage staff earnings and commissions',
};

export default function StaffEarningsPage() {
  return <StaffEarningsClient />;
}