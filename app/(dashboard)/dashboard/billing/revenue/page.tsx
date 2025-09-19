import { startOfMonth, endOfMonth } from 'date-fns';
import { BillingRevenuePage } from './client';
import { fetchRevenueReport } from '@/core/billing';

export default async function RevenuePage() {
  const filters = {
    date_from: startOfMonth(new Date()).toISOString(),
    date_to: endOfMonth(new Date()).toISOString(),
  };

  const result = await fetchRevenueReport(filters);

  return (
    <BillingRevenuePage
      initialReport={result.success ? result.data : null}
      error={result.success ? null : new Error(result.error || 'Failed to load revenue')}
    />
  );
}