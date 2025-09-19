import { CustomerProfile } from '@/core/customer/components/profile/customer-profile';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your profile information',
};

export default function CustomerProfilePage() {
  return <CustomerProfile />;
}