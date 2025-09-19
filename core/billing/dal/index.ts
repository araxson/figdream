import { createClient } from '@/lib/supabase/server';
import type {
  Invoice,
  InvoiceWithDetails,
  PaymentRecord,
  InvoiceFilters,
  CreateInvoiceInput,
  RecordPaymentInput,
  Billing,
  PaymentMethod,
  RevenueFilters,
  RevenueReport
} from '../types';

// Invoice operations
export async function getInvoices(filters?: InvoiceFilters): Promise<InvoiceWithDetails[]> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  let query = supabase
    .from('invoices')
    .select(`
      *,
      billing!inner(
        *,
        salon:salons(id, name, address),
        customer:users(id, email, full_name)
      ),
      line_items:invoice_line_items(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.customer_id) {
    query = query.eq('billing.customer_id', filters.customer_id);
  }
  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }
  if (filters?.min_amount) {
    query = query.gte('amount_due', filters.min_amount);
  }
  if (filters?.max_amount) {
    query = query.lte('amount_due', filters.max_amount);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data as InvoiceWithDetails[];
}

export async function getInvoiceById(id: string): Promise<InvoiceWithDetails> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      billing!inner(
        *,
        salon:salons(id, name, address, phone, email),
        customer:users(id, email, full_name, phone)
      ),
      line_items:invoice_line_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as InvoiceWithDetails;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Start transaction
  const { data: billing, error: billingError } = await supabase
    .from('billing')
    .insert({
      salon_id: input.salon_id,
      customer_id: input.customer_id,
      amount: calculateInvoiceTotal(input.line_items),
      status: 'pending',
      description: `Invoice for ${input.line_items.length} items`
    })
    .select()
    .single();

  if (billingError) throw billingError;

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}`;

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      billing_id: billing.id,
      invoice_number: invoiceNumber,
      due_date: input.due_date,
      amount_due: calculateInvoiceTotal(input.line_items),
      tax_amount: calculateTaxAmount(input.line_items),
      discount_amount: calculateDiscountAmount(input.line_items),
      status: 'pending'
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Create line items
  const lineItems = input.line_items.map(item => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.quantity * item.unit_price,
    tax_rate: item.tax_rate || 0,
    discount_percentage: item.discount_percentage || 0
  }));

  const { error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .insert(lineItems);

  if (lineItemsError) throw lineItemsError;

  return invoice;
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
): Promise<Invoice> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const updateData: any = { status };
  if (status === 'paid') {
    updateData.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw error;

  // Update billing status if invoice is paid
  if (status === 'paid') {
    await supabase
      .from('billing')
      .update({ status: 'completed' })
      .eq('id', data.billing_id);
  }

  return data;
}

// Payment operations
export async function recordPayment(input: RecordPaymentInput): Promise<Invoice> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Get invoice details
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*, billing!inner(*)')
    .eq('id', input.invoice_id)
    .single();

  if (invoiceError) throw invoiceError;

  // Update amount paid
  const newAmountPaid = (invoice.amount_paid || 0) + input.amount;
  const isPaid = newAmountPaid >= invoice.amount_due;

  const { data, error } = await supabase
    .from('invoices')
    .update({
      amount_paid: newAmountPaid,
      status: isPaid ? 'paid' : 'pending',
      paid_at: isPaid ? new Date().toISOString() : null
    })
    .eq('id', input.invoice_id)
    .select()
    .single();

  if (error) throw error;

  // Update billing record if fully paid
  if (isPaid) {
    await supabase
      .from('billing')
      .update({
        status: 'completed',
        payment_method: input.payment_method
      })
      .eq('id', invoice.billing.id);
  }

  // Store payment record in metadata
  const paymentRecord: PaymentRecord = {
    invoice_id: input.invoice_id,
    amount: input.amount,
    payment_method: input.payment_method,
    payment_date: input.payment_date,
    reference_number: input.reference_number,
    notes: input.notes,
    status: isPaid ? 'completed' : 'partial',
    created_by: user.id
  };

  // Update invoice metadata with payment history
  const currentMetadata = invoice.metadata || {};
  const paymentHistory = currentMetadata.payment_history || [];
  paymentHistory.push(paymentRecord);

  await supabase
    .from('invoices')
    .update({
      metadata: { ...currentMetadata, payment_history: paymentHistory }
    })
    .eq('id', input.invoice_id);

  return data;
}

export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Ensure user can only access their own payment methods
  if (user.id !== userId) {
    throw new Error('Unauthorized: Cannot access other users payment methods');
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) throw error;
  return data as PaymentMethod[];
}

// Revenue operations
export async function getRevenueAnalytics(filters: RevenueFilters): Promise<any[]> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  let query = supabase
    .from('revenue_analytics')
    .select('*')
    .gte('date', filters.date_from)
    .lte('date', filters.date_to);

  if (filters.salon_id) {
    query = query.eq('salon_id', filters.salon_id);
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function generateRevenueReport(filters: RevenueFilters): Promise<RevenueReport> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Get all completed appointments in the period
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(id, name, price),
      staff:staff_profiles(id, user_id, users(full_name))
    `)
    .eq('status', 'completed')
    .gte('start_time', filters.date_from)
    .lte('start_time', filters.date_to);

  if (apptError) throw apptError;

  // Calculate totals
  const totals = appointments?.reduce((acc, appt) => ({
    gross_revenue: acc.gross_revenue + (appt.total_amount || 0),
    tax_collected: acc.tax_collected + (appt.tax_amount || 0),
    discounts_given: acc.discounts_given + (appt.discount_amount || 0),
    tips_collected: acc.tips_collected + (appt.tip_amount || 0),
    net_revenue: acc.net_revenue + ((appt.total_amount || 0) - (appt.tax_amount || 0))
  }), {
    gross_revenue: 0,
    net_revenue: 0,
    tax_collected: 0,
    discounts_given: 0,
    refunds_issued: 0,
    tips_collected: 0
  }) || {
    gross_revenue: 0,
    net_revenue: 0,
    tax_collected: 0,
    discounts_given: 0,
    refunds_issued: 0,
    tips_collected: 0
  };

  // Calculate service breakdown
  const serviceMap = new Map();
  appointments?.forEach(appt => {
    if (appt.service) {
      const existing = serviceMap.get(appt.service.id) || {
        service_id: appt.service.id,
        service_name: appt.service.name,
        quantity_sold: 0,
        total_revenue: 0
      };
      existing.quantity_sold += 1;
      existing.total_revenue += appt.total_amount || 0;
      serviceMap.set(appt.service.id, existing);
    }
  });

  const by_service = Array.from(serviceMap.values()).map(s => ({
    ...s,
    average_price: s.total_revenue / s.quantity_sold,
    percentage_of_total: (s.total_revenue / totals.gross_revenue) * 100
  }));

  // Calculate staff breakdown
  const staffMap = new Map();
  appointments?.forEach(appt => {
    if (appt.staff) {
      const staffName = appt.staff.users?.full_name || 'Unknown';
      const existing = staffMap.get(appt.staff.id) || {
        staff_id: appt.staff.id,
        staff_name: staffName,
        services_performed: 0,
        gross_revenue: 0,
        commission_earned: 0,
        tips_received: 0,
        total_earnings: 0
      };
      existing.services_performed += 1;
      existing.gross_revenue += appt.total_amount || 0;
      existing.tips_received += appt.tip_amount || 0;
      existing.commission_earned += ((appt.total_amount || 0) * 0.3); // 30% commission default
      existing.total_earnings = existing.commission_earned + existing.tips_received;
      staffMap.set(appt.staff.id, existing);
    }
  });

  const by_staff = Array.from(staffMap.values());

  // Calculate payment method breakdown
  const paymentMethodMap = new Map();
  appointments?.forEach(appt => {
    const method = appt.payment_method || 'cash';
    const existing = paymentMethodMap.get(method) || {
      method: method as any,
      transaction_count: 0,
      total_amount: 0,
      percentage: 0
    };
    existing.transaction_count += 1;
    existing.total_amount += appt.total_amount || 0;
    paymentMethodMap.set(method, existing);
  });

  const by_payment_method = Array.from(paymentMethodMap.values()).map(p => ({
    ...p,
    percentage: (p.total_amount / totals.gross_revenue) * 100
  }));

  // Calculate daily breakdown
  const dailyMap = new Map();
  appointments?.forEach(appt => {
    const date = new Date(appt.start_time).toISOString().split('T')[0];
    const existing = dailyMap.get(date) || {
      date,
      revenue: 0,
      transactions: 0,
      services: 0
    };
    existing.revenue += appt.total_amount || 0;
    existing.transactions += 1;
    existing.services += 1;
    dailyMap.set(date, existing);
  });

  const by_day = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    period: {
      start: filters.date_from,
      end: filters.date_to,
      type: (filters.group_by as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom') || 'custom'
    },
    totals,
    breakdown: {
      by_service,
      by_staff,
      by_payment_method,
      by_day
    },
    transactions: {
      count: appointments?.length || 0,
      average_value: totals.gross_revenue / (appointments?.length || 1),
      highest_value: Math.max(...(appointments?.map(a => a.total_amount || 0) || [0])),
      lowest_value: Math.min(...(appointments?.map(a => a.total_amount || 0) || [0]))
    }
  };
}

// Helper functions
function calculateInvoiceTotal(lineItems: CreateInvoiceInput['line_items']): number {
  return lineItems.reduce((total, item) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * ((item.discount_percentage || 0) / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * ((item.tax_rate || 0) / 100);
    return total + afterDiscount + tax;
  }, 0);
}

function calculateTaxAmount(lineItems: CreateInvoiceInput['line_items']): number {
  return lineItems.reduce((total, item) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * ((item.discount_percentage || 0) / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * ((item.tax_rate || 0) / 100);
    return total + tax;
  }, 0);
}

function calculateDiscountAmount(lineItems: CreateInvoiceInput['line_items']): number {
  return lineItems.reduce((total, item) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * ((item.discount_percentage || 0) / 100);
    return total + discount;
  }, 0);
}