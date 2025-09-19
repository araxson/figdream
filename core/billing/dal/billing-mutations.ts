import { createClient } from "@/lib/supabase/server";
import type {
  Billing,
  BillingInsert,
  BillingUpdate,
  PaymentMethod,
  Invoice,
} from "./billing-types";

export async function createBilling(data: BillingInsert): Promise<Billing> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
  const mock = {
    id: crypto.randomUUID(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return mock as Billing;
}

export async function updateBilling(
  id: string,
  updates: BillingUpdate,
): Promise<Billing> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
  throw new Error("Not implemented");
}

export async function deleteBilling(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when database table is available
}

export async function processPayment(
  billingId: string,
  paymentMethodId: string,
): Promise<Billing> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement payment processing with Stripe
  throw new Error("Payment processing not implemented");
}

export async function refundPayment(
  billingId: string,
  amount?: number,
): Promise<Billing> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement refund with Stripe
  throw new Error("Refund processing not implemented");
}

export async function createInvoice(billingId: string): Promise<Invoice> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement invoice generation
  throw new Error("Invoice generation not implemented");
}

export async function addPaymentMethod(
  customerId: string,
  paymentMethod: Partial<PaymentMethod>,
): Promise<PaymentMethod> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement payment method addition with Stripe
  const mock = {
    id: crypto.randomUUID(),
    customer_id: customerId,
    type: paymentMethod.type || "card",
    is_default: paymentMethod.is_default || false,
    ...paymentMethod,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return mock as PaymentMethod;
}

export async function removePaymentMethod(
  paymentMethodId: string,
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement payment method removal with Stripe
}

export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string,
): Promise<PaymentMethod> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement default payment method setting
  throw new Error("Not implemented");
}

export async function retryFailedPayment(billingId: string): Promise<Billing> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement retry logic with Stripe
  throw new Error("Payment retry not implemented");
}
