import { Metadata } from 'next';
import { RateLimitsManager } from '@/components/features/monitoring/rate-limits-manager';

export const metadata: Metadata = {
  title: 'Rate Limits | Dashboard',
  description: 'Configure API rate limiting and usage policies',
};

export default function RateLimitsPage() {
  return <RateLimitsManager />;
}