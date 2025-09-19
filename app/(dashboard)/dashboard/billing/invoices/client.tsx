'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceList } from '@/core/billing/components/invoice-list';
import { PaymentForm } from '@/core/billing/components/payment-form';
import { recordInvoicePayment } from '@/core/billing/actions';
import type { InvoiceWithDetails, InvoiceFilters, RecordPaymentInput } from '@/core/billing/types';

interface BillingInvoicesPageProps {
  initialInvoices: InvoiceWithDetails[];
  error: Error | null;
}

export function BillingInvoicesPage({ initialInvoices, error }: BillingInvoicesPageProps) {
  const router = useRouter();
  const [invoices] = useState(initialInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  const handleViewInvoice = (invoice: InvoiceWithDetails) => {
    router.push(`/billing/invoices/${invoice.id}`);
  };

  const handleSendInvoice = (_invoice: InvoiceWithDetails) => {
    toast.info('Email functionality coming soon');
  };

  const handleRecordPayment = (invoice: InvoiceWithDetails) => {
    setSelectedInvoice(invoice);
    setIsPaymentFormOpen(true);
  };

  const handleDownloadInvoice = (_invoice: InvoiceWithDetails) => {
    toast.info('PDF generation coming soon');
  };

  const handleFilterChange = (_filters: InvoiceFilters) => {
    // TODO: Implement filter logic
  };

  const handlePaymentSubmit = async (data: RecordPaymentInput) => {
    const result = await recordInvoicePayment(data);

    if (result.success) {
      toast.success('Payment recorded successfully');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to record payment');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track all your invoices
          </p>
        </div>
        <Button onClick={() => router.push('/billing/invoices/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <InvoiceList
        invoices={invoices}
        loading={false}
        error={error}
        onViewInvoice={handleViewInvoice}
        onSendInvoice={handleSendInvoice}
        onRecordPayment={handleRecordPayment}
        onDownloadInvoice={handleDownloadInvoice}
        onFilterChange={handleFilterChange}
      />

      {selectedInvoice && (
        <PaymentForm
          invoice={selectedInvoice}
          isOpen={isPaymentFormOpen}
          onClose={() => {
            setIsPaymentFormOpen(false);
            setSelectedInvoice(null);
          }}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
}