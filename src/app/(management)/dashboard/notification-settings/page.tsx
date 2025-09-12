import { Metadata } from 'next';
import { NotificationSettingsManager } from '@/components/features/notifications/notification-settings-manager';

export const metadata: Metadata = {
  title: 'Notification Settings | Dashboard',
  description: 'Manage your notification preferences',
};

export default function NotificationSettingsPage() {
  return <NotificationSettingsManager />;
}