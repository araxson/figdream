import { Metadata } from 'next';
import { EmailCampaignsManager } from '@/components/features/campaigns/email-campaigns-manager';

export const metadata: Metadata = {
  title: 'Email Campaigns | Dashboard',
  description: 'Create and manage email marketing campaigns',
};

export default function EmailCampaignsPage() {
  return <EmailCampaignsManager />;
}