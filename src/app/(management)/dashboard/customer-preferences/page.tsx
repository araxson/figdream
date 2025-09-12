import { Metadata } from 'next';
import { CustomerPreferencesManager } from '@/components/features/customers/customer-preferences-manager';

export const metadata: Metadata = {
  title: 'Customer Preferences | Dashboard',
  description: 'Manage customer preferences and personalization settings',
};

export default function CustomerPreferencesPage() {
  return <CustomerPreferencesManager />;
}