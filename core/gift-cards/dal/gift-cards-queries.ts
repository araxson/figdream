import { createClient } from "@/lib/supabase/server";
import type {
  GiftCard,
  GiftCardWithPurchaser,
  GiftCardWithTransactions,
  GiftCardWithRelations,
  GiftCardFilters,
  GiftCardTransactionFilters,
  GiftCardStats,
  GiftCardValidationResult,
  GiftCardTransaction,
} from "./gift-cards-types";

/**
 * Get all gift cards with filters
 */
export async function getGiftCards(
  filters: GiftCardFilters = {},
): Promise<GiftCardWithPurchaser[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  // For now, return mock data
  return [];
}

/**
 * Get a single gift card by ID
 */
export async function getGiftCardById(
  id: string,
): Promise<GiftCardWithRelations | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  return null;
}

/**
 * Get gift card by code
 */
export async function getGiftCardByCode(
  code: string,
): Promise<GiftCard | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  return null;
}

/**
 * Validate a gift card code
 */
export async function validateGiftCard(
  code: string,
  amount?: number,
): Promise<GiftCardValidationResult> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  return {
    valid: false,
    error: "Gift cards feature not yet available",
  };
}

/**
 * Get gift card transactions
 */
export async function getGiftCardTransactions(
  filters: GiftCardTransactionFilters = {},
): Promise<GiftCardTransaction[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_card_transactions table is available
  return [];
}

/**
 * Get gift cards by purchaser
 */
export async function getGiftCardsByPurchaser(
  purchaserId: string,
  limit = 20,
): Promise<GiftCardWithTransactions[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  return [];
}

/**
 * Get gift cards by recipient email
 */
export async function getGiftCardsByRecipient(
  recipientEmail: string,
  limit = 20,
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

/**
 * Get gift card statistics
 */
export async function getGiftCardStats(
  salonId?: string,
): Promise<GiftCardStats> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Implement when gift_cards table is available
  return {
    total_issued: 0,
    total_value: 0,
    total_redeemed: 0,
    total_balance: 0,
    active_cards: 0,
    expired_cards: 0,
    depleted_cards: 0,
  };
}

/**
 * Get expiring gift cards
 */
export async function getExpiringGiftCards(
  daysUntilExpiry = 30,
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

/**
 * Search gift cards
 */
export async function searchGiftCards(
  query: string,
  salonId?: string,
  limit = 10,
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
