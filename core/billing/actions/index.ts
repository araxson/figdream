'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  recordPayment,
  getPaymentMethods,
  getRevenueAnalytics,
  generateRevenueReport,
} from '../dal';
import type {
  InvoiceFilters,
  CreateInvoiceInput,
  RecordPaymentInput,
  RevenueFilters,
} from '../types';

// Note: Re-exports have been removed from this file. Import directly from the specific action files.
// This file only contains direct server action definitions.

// Invoice actions
export async function fetchInvoices(filters?: InvoiceFilters) {
  try {
    const invoices = await getInvoices(filters);
    return { success: true, data: invoices };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoices',
    };
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await getInvoiceById(id);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoice',
    };
  }
}

const createInvoiceSchema = z.object({
  customer_id: z.string().uuid(),
  salon_id: z.string().uuid(),
  due_date: z.string(),
  line_items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().int().min(1),
      unit_price: z.number().min(0),
      tax_rate: z.number().min(0).max(100).optional(),
      discount_percentage: z.number().min(0).max(100).optional(),
    })
  ).min(1),
  notes: z.string().optional(),
  send_email: z.boolean().optional(),
});

export async function createNewInvoice(input: CreateInvoiceInput) {
  try {
    const validated = createInvoiceSchema.parse(input);
    const invoice = await createInvoice(validated);

    if (validated.send_email) {
      // TODO: Implement email sending
    }

    revalidatePath('/billing/invoices');
    revalidatePath('/dashboard');

    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create invoice',
    };
  }
}

export async function markInvoiceAsPaid(invoiceId: string) {
  try {
    const invoice = await updateInvoiceStatus(invoiceId, 'paid');

    revalidatePath('/billing/invoices');
    revalidatePath(`/billing/invoices/${invoiceId}`);
    revalidatePath('/dashboard');

    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update invoice',
    };
  }
}

export async function cancelInvoice(invoiceId: string) {
  try {
    const invoice = await updateInvoiceStatus(invoiceId, 'cancelled');

    revalidatePath('/billing/invoices');
    revalidatePath(`/billing/invoices/${invoiceId}`);
    revalidatePath('/dashboard');

    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel invoice',
    };
  }
}

// Payment actions
const recordPaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().min(0.01),
  payment_method: z.enum(['cash', 'card', 'bank_transfer', 'paypal', 'other']),
  payment_date: z.string(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export async function recordInvoicePayment(input: RecordPaymentInput) {
  try {
    const validated = recordPaymentSchema.parse(input);
    const invoice = await recordPayment(validated);

    revalidatePath('/billing/invoices');
    revalidatePath(`/billing/invoices/${input.invoice_id}`);
    revalidatePath('/billing/payments');
    revalidatePath('/dashboard');

    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error recording payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record payment',
    };
  }
}

export async function fetchPaymentMethods(userId: string) {
  try {
    const methods = await getPaymentMethods(userId);
    return { success: true, data: methods };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment methods',
    };
  }
}

// Revenue analytics actions
export async function fetchRevenueAnalytics(filters: RevenueFilters) {
  try {
    const analytics = await getRevenueAnalytics(filters);
    return { success: true, data: analytics };
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics',
    };
  }
}

export async function fetchRevenueReport(filters: RevenueFilters) {
  try {
    const report = await generateRevenueReport(filters);
    return { success: true, data: report };
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    };
  }
}

// Export actions
export async function exportInvoicesToCSV(filters?: InvoiceFilters) {
  try {
    const invoices = await getInvoices(filters);

    // Convert to CSV format
    const headers = ['Invoice #', 'Customer', 'Amount Due', 'Amount Paid', 'Status', 'Due Date', 'Created'];
    const rows = invoices.map(invoice => [
      invoice.invoice_number,
      invoice.billing?.customer?.full_name || '',
      invoice.amount_due.toString(),
      (invoice.amount_paid || 0).toString(),
      invoice.status,
      invoice.due_date,
      invoice.created_at,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return {
      success: true,
      data: {
        content: csv,
        filename: `invoices_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv',
      },
    };
  } catch (error) {
    console.error('Error exporting invoices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export invoices',
    };
  }
}

export async function exportRevenueReportToCSV(filters: RevenueFilters) {
  try {
    const report = await generateRevenueReport(filters);

    // Convert to CSV format - multiple sections
    const sections = [];

    // Summary section
    sections.push('REVENUE SUMMARY');
    sections.push('Period,' + `${report.period.start} to ${report.period.end}`);
    sections.push('Gross Revenue,' + report.totals.gross_revenue);
    sections.push('Net Revenue,' + report.totals.net_revenue);
    sections.push('Tax Collected,' + report.totals.tax_collected);
    sections.push('Tips Collected,' + report.totals.tips_collected);
    sections.push('Discounts Given,' + report.totals.discounts_given);
    sections.push('');

    // Daily breakdown
    sections.push('DAILY BREAKDOWN');
    sections.push('Date,Revenue,Transactions');
    report.breakdown.by_day.forEach(day => {
      sections.push(`${day.date},${day.revenue},${day.transactions}`);
    });
    sections.push('');

    // Service breakdown
    sections.push('SERVICE BREAKDOWN');
    sections.push('Service,Quantity,Revenue,Average Price,% of Total');
    report.breakdown.by_service.forEach(service => {
      sections.push(
        `"${service.service_name}",${service.quantity_sold},${service.total_revenue},${service.average_price},${service.percentage_of_total}%`
      );
    });
    sections.push('');

    // Staff breakdown
    sections.push('STAFF PERFORMANCE');
    sections.push('Staff Member,Services,Revenue,Commission,Tips,Total Earnings');
    report.breakdown.by_staff.forEach(staff => {
      sections.push(
        `"${staff.staff_name}",${staff.services_performed},${staff.gross_revenue},${staff.commission_earned},${staff.tips_received},${staff.total_earnings}`
      );
    });

    const csv = sections.join('\n');

    return {
      success: true,
      data: {
        content: csv,
        filename: `revenue_report_${report.period.start}_to_${report.period.end}.csv`,
        mimeType: 'text/csv',
      },
    };
  } catch (error) {
    console.error('Error exporting revenue report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export report',
    };
  }
}

// Bulk operations
export async function markMultipleInvoicesAsPaid(invoiceIds: string[]) {
  try {
    const results = await Promise.all(
      invoiceIds.map(id => updateInvoiceStatus(id, 'paid'))
    );

    revalidatePath('/billing/invoices');
    revalidatePath('/dashboard');

    return { success: true, data: results };
  } catch (error) {
    console.error('Error marking invoices as paid:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update invoices',
    };
  }
}

export async function sendInvoiceReminders(invoiceIds: string[]) {
  try {
    const invoices = await Promise.all(
      invoiceIds.map(id => getInvoiceById(id))
    );

    // TODO: Implement email sending

    return { success: true, data: { sent: invoices.length } };
  } catch (error) {
    console.error('Error sending reminders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reminders',
    };
  }
}