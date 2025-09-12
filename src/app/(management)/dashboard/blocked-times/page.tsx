import { Metadata } from 'next';
import { BlockedTimesManager } from '@/components/features/blocked-times/blocked-times-manager';

export const metadata: Metadata = {
  title: 'Blocked Times | Dashboard',
  description: 'Manage blocked time periods for your salon',
};

export default function BlockedTimesPage() {
  return <BlockedTimesManager />;
}