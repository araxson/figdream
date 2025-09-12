import { Metadata } from 'next';
import { SmsOptoutsManager } from '@/components/features/campaigns/sms-optouts-manager';

export const metadata: Metadata = {
  title: 'SMS Opt-outs | Dashboard',
  description: 'Manage SMS opt-out preferences and compliance',
};

export default function SmsOptoutsPage() {
  return <SmsOptoutsManager />;
}