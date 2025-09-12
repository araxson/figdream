import { Metadata } from 'next';
import { ReferralProgramsManager } from '@/components/features/marketing/referral-programs-manager';

export const metadata: Metadata = {
  title: 'Referral Programs | Dashboard',
  description: 'Manage customer referral rewards and tracking',
};

export default function ReferralProgramsPage() {
  return <ReferralProgramsManager />;
}