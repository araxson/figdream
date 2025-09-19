// Base types (mocked until database tables are available)
export interface GiftCard {
  id: string;
  code: string;
  salon_id?: string;
  amount: number;
  balance: number;
  currency: string;
  purchaser_id: string;
  recipient_email?: string;
  recipient_name?: string;
  recipient_phone?: string;
  message?: string;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GiftCardInsert
  extends Omit<GiftCard, "id" | "created_at" | "updated_at" | "balance"> {
  balance?: number;
}

export type GiftCardUpdate = Partial<
  Omit<GiftCard, "id" | "created_at" | "code">
>;

export interface GiftCardTransaction {
  id: string;
  gift_card_id: string;
  type: "purchase" | "redemption" | "refund" | "adjustment";
  amount: number;
  balance_after: number;
  appointment_id?: string;
  staff_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export type GiftCardTransactionInsert = Omit<
  GiftCardTransaction,
  "id" | "created_at"
>;

// Extended types with relations
export interface GiftCardWithPurchaser extends GiftCard {
  purchaser?: {
    id: string;
    display_name: string;
    email?: string;
  };
}

export interface GiftCardWithTransactions extends GiftCard {
  transactions?: GiftCardTransaction[];
}

export interface GiftCardWithRelations extends GiftCard {
  purchaser?: {
    id: string;
    display_name: string;
    email?: string;
  };
  transactions?: GiftCardTransaction[];
  salon?: {
    id: string;
    name: string;
  };
}

// Filter types
export interface GiftCardFilters {
  salon_id?: string;
  purchaser_id?: string;
  recipient_email?: string;
  is_active?: boolean;
  status?: "active" | "expired" | "depleted" | "inactive";
  created_after?: string;
  created_before?: string;
  search?: string;
}

export interface GiftCardTransactionFilters {
  gift_card_id?: string;
  type?: GiftCardTransaction["type"];
  appointment_id?: string;
  staff_id?: string;
  created_after?: string;
  created_before?: string;
}

// Stats types
export interface GiftCardStats {
  total_issued: number;
  total_value: number;
  total_redeemed: number;
  total_balance: number;
  active_cards: number;
  expired_cards: number;
  depleted_cards: number;
}

// Response types
export interface GiftCardValidationResult {
  valid: boolean;
  card?: GiftCard;
  error?: string;
}

export interface GiftCardRedemptionRequest {
  code: string;
  amount: number;
  appointment_id?: string;
  staff_id?: string;
  notes?: string;
}
