import { CustomerPreferences } from '@/core/customer/components/preferences/customer-preferences';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preferences',
  description: 'Manage your booking and notification preferences',
};

export default function PreferencesPage() {
  return <CustomerPreferences />;
}