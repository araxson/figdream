import { BillingInvoicesPage } from './client';
import { fetchInvoices } from '@/core/billing';

export default async function InvoicesPage() {
  const result = await fetchInvoices();

  return (
    <BillingInvoicesPage
      initialInvoices={result.success ? (result.data || []) : []}
      error={result.success ? null : new Error(result.error || 'Failed to load invoices')}
    />
  );
}