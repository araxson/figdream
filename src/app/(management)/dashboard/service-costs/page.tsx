import { Metadata } from 'next';
import { ServiceCostsManager } from '@/components/features/finance/service-costs-manager';

export const metadata: Metadata = {
  title: 'Service Costs | Dashboard',
  description: 'Analyze service profitability and cost structure',
};

export default function ServiceCostsPage() {
  return <ServiceCostsManager />;
}