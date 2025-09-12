import { Metadata } from 'next';
import { SmsCampaignsManager } from '@/components/features/campaigns/sms-campaigns-manager';

export const metadata: Metadata = {
  title: 'SMS Campaigns | Dashboard',
  description: 'Create and manage SMS marketing campaigns',
};

export default function SmsCampaignsPage() {
  return <SmsCampaignsManager />;
}