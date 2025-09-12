import { Metadata } from 'next';
import { LoyaltyProgramsManager } from '@/components/features/loyalty/loyalty-programs-manager';

export const metadata: Metadata = {
  title: 'Loyalty Programs | Dashboard',
  description: 'Manage customer loyalty rewards and tiers',
};

export default function LoyaltyPage() {
  return <LoyaltyProgramsManager />;
}