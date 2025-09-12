import { Metadata } from 'next';
import { PricingPlansManager } from '@/components/features/pricing/pricing-plans-manager';

export const metadata: Metadata = {
  title: 'Pricing Plans | Dashboard',
  description: 'Manage subscription plans and features',
};

export default function PricingPlansPage() {
  return <PricingPlansManager />;
}