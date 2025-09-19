"use server";

import { createClient } from "@/lib/supabase/server";
import type { Invoice, InvoiceLineItem } from "../dal/billing-types";

// PDF generation utilities (would require a PDF library like @react-pdf/renderer or puppeteer)
// For now, we'll create the structure and mock the PDF generation

interface InvoicePDFData {
  invoice: Invoice & {
    billing: {
      customer: { id: string; email: string; };
      salon: { id: string; name: string; business_name: string; };
    };
    line_items: InvoiceLineItem[];
  };
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
    website?: string;
  };
}

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Get invoice details
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (error || !invoice) {
      throw new Error("Invoice not found");
    }

    // Get billing details
    const { data: billing } = await supabase
      .from("billing")
      .select("*")
      .eq("id", invoice.billing_id)
      .single();

    // Get line items
    const { data: lineItems } = await supabase
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", invoiceId);

    // Company information (mock for now)
    const company = {
      name: "FigDream Salon",
      address: "123 Main St",
      email: "contact@figdream.com",
      phone: "555-0123",
      website: "https://figdream.com",
    };

    const pdfData: InvoicePDFData = {
      invoice: {
        ...invoice,
        line_items: lineItems || [],
        billing: {
          customer: { id: billing?.customer_id || '', email: 'customer@example.com' },
          salon: { id: billing?.salon_id || '', name: 'Salon', business_name: 'Salon Business' },
        },
      } as any,
      company,
    };

    // Generate PDF using a library like @react-pdf/renderer
    const pdfBuffer = await generatePDFBuffer(pdfData);

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw new Error("Failed to generate invoice PDF");
  }
}

export async function createInvoice(
  billingId: string,
  dueDate: string,
  lineItems: Omit<InvoiceLineItem, "id" | "invoice_id" | "created_at">[]
): Promise<Invoice> {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Get billing details
    const { data: billing, error: billingError } = await supabase
      .from("billing")
      .select("*")
      .eq("id", billingId)
      .single();

    if (billingError || !billing) {
      throw new Error("Billing record not found");
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = lineItems.reduce((sum, item) =>
      sum + (item.total_price * (item.tax_rate || 0)), 0);
    const discountAmount = lineItems.reduce((sum, item) =>
      sum + (item.total_price * (item.discount_percentage || 0) / 100), 0);

    const amountDue = subtotal + taxAmount - discountAmount;

    // Create invoice
    const { data: newInvoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        billing_id: billingId,
        invoice_number: invoiceNumber,
        due_date: dueDate,
        amount_due: amountDue,
        amount_paid: 0,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        status: "pending",
        metadata: {
          subtotal,
          created_by: user.id,
        },
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Create line items
    const lineItemsWithInvoiceId = lineItems.map(item => ({
      ...item,
      invoice_id: newInvoice.id,
    }));

    const { error: lineItemsError } = await supabase
      .from("invoice_line_items")
      .insert(lineItemsWithInvoiceId);

    if (lineItemsError) throw lineItemsError;

    // Fetch line items
    const { data: createdLineItems } = await supabase
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", newInvoice.id);

    return {
      ...newInvoice,
      line_items: createdLineItems || [],
    } as Invoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice");
  }
}

export async function markInvoiceAsPaid(
  invoiceId: string,
  amountPaid: number,
  paymentDate?: string
): Promise<Invoice> {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: updatedInvoice, error } = await supabase
      .from("invoices")
      .update({
        amount_paid: amountPaid,
        paid_at: paymentDate || new Date().toISOString(),
        status: "paid",
        metadata: {
          marked_paid_by: user.id,
          marked_paid_at: new Date().toISOString(),
        } as any,
      })
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...updatedInvoice,
      line_items: [],
    } as Invoice;
  } catch (error) {
    console.error("Error marking invoice as paid:", error);
    throw new Error("Failed to mark invoice as paid");
  }
}

export async function sendInvoiceEmail(
  invoiceId: string,
  recipientEmail: string,
  message?: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Get invoice details
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (error || !invoice) {
      throw new Error("Invoice not found");
    }

    // Get billing details for salon info
    const { data: billing } = await supabase
      .from("billing")
      .select("salon_id")
      .eq("id", invoice.billing_id)
      .single();

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceId);

    // Send email (would integrate with email service like SendGrid, AWS SES, etc.)
    await sendEmailWithAttachment({
      to: recipientEmail,
      subject: `Invoice ${invoice.invoice_number} from FigDream`,
      message: message || `Please find your invoice attached.`,
      attachment: {
        filename: `invoice-${invoice.invoice_number}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    });

    // Log email sent
    await supabase
      .from("invoices")
      .update({
        metadata: {
          ...(invoice.metadata as any || {}),
          email_sent_at: new Date().toISOString(),
          email_sent_by: user.id,
          email_sent_to: recipientEmail,
        },
      })
      .eq("id", invoiceId);

  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw new Error("Failed to send invoice email");
  }
}

export async function voidInvoice(invoiceId: string, reason?: string): Promise<Invoice> {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: updatedInvoice, error } = await supabase
      .from("invoices")
      .update({
        status: "cancelled",
        metadata: {
          voided_by: user.id,
          voided_at: new Date().toISOString(),
          void_reason: reason,
        } as any,
      })
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...updatedInvoice,
      line_items: [],
    } as Invoice;
  } catch (error) {
    console.error("Error voiding invoice:", error);
    throw new Error("Failed to void invoice");
  }
}

// Helper functions
async function generateInvoiceNumber(): Promise<string> {
  const supabase = await createClient();

  // Get the latest invoice number
  const { data: latestInvoice } = await supabase
    .from("invoices")
    .select("invoice_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (latestInvoice?.invoice_number) {
    // Extract number and increment
    const match = latestInvoice.invoice_number.match(/INV-(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `INV-${nextNumber.toString().padStart(6, "0")}`;
    }
  }

  // Default starting number
  return "INV-000001";
}

async function generatePDFBuffer(data: InvoicePDFData): Promise<Buffer> {
  // This would integrate with a PDF generation library
  // For now, we'll return a mock buffer

  // Example using @react-pdf/renderer:
  /*
  import { pdf } from '@react-pdf/renderer';
  import { InvoicePDFDocument } from './invoice-pdf-template';

  const doc = <InvoicePDFDocument data={data} />;
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  return Buffer.from(await blob.arrayBuffer());
  */

  // Mock implementation
  const mockPDFContent = `
    Invoice: ${data.invoice.invoice_number}
    Company: ${data.company.name}
    Customer: ${data.invoice.billing.customer.email}
    Amount Due: $${data.invoice.amount_due}
    Due Date: ${data.invoice.due_date}

    Line Items:
    ${data.invoice.line_items.map(item =>
      `- ${item.description}: ${item.quantity} x $${item.unit_price} = $${item.total_price}`
    ).join('\n')}
  `;

  return Buffer.from(mockPDFContent, 'utf-8');
}

async function sendEmailWithAttachment(emailData: {
  to: string;
  subject: string;
  message: string;
  attachment: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
}): Promise<void> {
  // This would integrate with an email service
  // Email sending logic would be implemented here
  // Temporarily disabled for production

  // Mock successful send
  await new Promise(resolve => setTimeout(resolve, 1000));
}