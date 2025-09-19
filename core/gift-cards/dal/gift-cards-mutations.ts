import { createClient } from "@/lib/supabase/server";
import type {
  GiftCard,
  GiftCardInsert,
  GiftCardUpdate,
  GiftCardTransaction,
  GiftCardTransactionInsert,
  GiftCardRedemptionRequest,
} from "./gift-cards-types";

/**
 * Create a new gift card
 */
export async function createGiftCard(data: GiftCardInsert): Promise<GiftCard> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  // For now, return mock data
  const mockCard: GiftCard = {
    ...data,
    id: crypto.randomUUID(),
    code: data.code || generateGiftCardCode(),
    balance: data.balance ?? data.amount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return mockCard;
}

/**
 * Update a gift card
 */
export async function updateGiftCard(
  id: string,
  updates: GiftCardUpdate,
): Promise<GiftCard> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  throw new Error("Gift cards feature not yet available");
}

/**
 * Redeem a gift card
 */
export async function redeemGiftCard(
  redemption: GiftCardRedemptionRequest,
): Promise<GiftCardTransaction> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  throw new Error("Gift cards feature not yet available");
}

/**
 * Refund to a gift card
 */
export async function refundToGiftCard(
  giftCardId: string,
  amount: number,
  appointmentId?: string,
  notes?: string,
): Promise<GiftCardTransaction> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_card_transactions table is available
  throw new Error("Gift cards feature not yet available");
}

/**
 * Adjust gift card balance
 */
export async function adjustGiftCardBalance(
  giftCardId: string,
  amount: number,
  reason: string,
): Promise<GiftCardTransaction> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_card_transactions table is available
  throw new Error("Gift cards feature not yet available");
}

/**
 * Deactivate a gift card
 */
export async function deactivateGiftCard(
  id: string,
  reason?: string,
): Promise<GiftCard> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  throw new Error("Gift cards feature not yet available");
}

/**
 * Reactivate a gift card
 */
export async function reactivateGiftCard(id: string): Promise<GiftCard> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  throw new Error("Gift cards feature not yet available");
}

/**
 * Extend gift card validity
 */
export async function extendGiftCardValidity(
  id: string,
  newValidUntil: string,
): Promise<GiftCard> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  throw new Error("Gift cards feature not yet available");
}

/**
 * Send gift card notification
 */
export async function sendGiftCardNotification(
  giftCardId: string,
  type: "purchase" | "reminder" | "expiry",
): Promise<boolean> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table and email service are available
  return false;
}

/**
 * Bulk create gift cards
 */
export async function bulkCreateGiftCards(
  cards: GiftCardInsert[],
  salonId?: string,
): Promise<GiftCard[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  return [];
}

// Helper function to generate unique gift card codes
function generateGiftCardCode(prefix = "GC"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
