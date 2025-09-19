import { Database, Json } from "@/types/database.types";

// Database types
export type CustomerProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type CustomerProfileInsert =
  Database["public"]["Tables"]["profiles"]["Insert"];
export type CustomerProfileUpdate =
  Database["public"]["Tables"]["profiles"]["Update"];

// These tables don't exist yet, using placeholder types
export interface CustomerPreference {
  id: string;
  customer_id: string;
  preference_type: string;
  preference_value: Json;
  created_at: string;
  updated_at: string;
}
export type CustomerPreferenceInsert = Omit<
  CustomerPreference,
  "id" | "created_at" | "updated_at"
>;
export type CustomerPreferenceUpdate = Partial<
  Omit<CustomerPreference, "id" | "customer_id" | "created_at">
>;

export type CustomerFavorite =
  Database["public"]["Tables"]["customer_favorites"]["Row"];
export type CustomerFavoriteInsert =
  Database["public"]["Tables"]["customer_favorites"]["Insert"];

// These tables don't exist yet, using placeholder types
export interface CustomerNote {
  id: string;
  customer_id: string;
  staff_id?: string;
  salon_id?: string;
  note: string;
  created_at: string;
  created_by: string;
}
export type CustomerNoteInsert = Omit<CustomerNote, "id" | "created_at">;
export type CustomerNoteUpdate = Partial<
  Omit<CustomerNote, "id" | "customer_id" | "created_at" | "created_by">
>;

export interface LoyaltyPoints {
  id: string;
  customer_id: string;
  current_points: number;
  lifetime_points: number;
  tier?: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  type: LoyaltyTransactionType;
  points: number;
  description?: string;
  reference_id?: string;
  created_at: string;
}

// Enums
export type FavoriteType = "salon" | "staff" | "service";

export type LoyaltyTransactionType =
  | "earned"
  | "redeemed"
  | "expired"
  | "adjusted";

export type CustomerStatus = "active" | "inactive" | "suspended" | "deleted";

// Extended types with relations
export interface CustomerProfileWithRelations
  extends Omit<CustomerProfile, "preferences"> {
  // Base profile properties that might be missing
  display_name?: string;
  is_active?: boolean;

  // Computed/aggregated properties
  preferences?: CustomerPreference | Json | null;
  favorites?: CustomerFavorite[];
  notes?: CustomerNote[];
  appointments?: Array<{
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    total_amount?: number;
  }>;
  loyalty_points?: LoyaltyPoints;
  total_spent?: number;
  visit_count?: number;
  last_visit?: string;
  is_vip?: boolean;

  // Additional computed properties used in UI
  lifetime_value?: number;
  average_rating?: number;
  visit_frequency?: string;
  preferred_time?: string;
}

export interface CustomerWithAppointments extends CustomerProfile {
  appointments: {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    total_amount: number;
    service?: {
      id: string;
      name: string;
    };
    staff?: {
      id: string;
      user?: {
        display_name: string;
      };
    };
    salon?: {
      id: string;
      name: string;
    };
  }[];
}

export interface CustomerFavoriteWithDetails extends CustomerFavorite {
  salon?: Database["public"]["Tables"]["salons"]["Row"];
  staff?: Database["public"]["Tables"]["staff_profiles"]["Row"] & {
    user?: CustomerProfile;
  };
  service?: Database["public"]["Tables"]["services"]["Row"];
}

// Filter types
export interface CustomerFilters {
  salon_id?: string;
  status?: CustomerStatus;
  search?: string;
  created_after?: string;
  created_before?: string;
  has_appointments?: boolean;
  is_vip?: boolean;
  min_visits?: number;
  max_visits?: number;
  min_spent?: number;
  max_spent?: number;
}

export interface CustomerPreferenceFilters {
  customer_id?: string;
  salon_id?: string;
}

export interface CustomerFavoriteFilters {
  customer_id?: string;
  type?: FavoriteType;
  salon_id?: string;
  staff_id?: string;
  service_id?: string;
}

// Response types
export interface CustomerListResponse {
  customers: CustomerProfileWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerMetrics {
  total_customers: number;
  new_customers_this_month: number;
  returning_customers: number;
  average_lifetime_value: number;
  top_spenders: CustomerProfileWithRelations[];
  most_loyal: CustomerProfileWithRelations[];
}

export interface CustomerInsights {
  customer_id: string;
  preferred_services: string[];
  preferred_staff: string[];
  preferred_times: string[];
  average_spend: number;
  visit_frequency: number;
  last_visit: string;
  next_predicted_visit?: string;
  churn_risk?: "low" | "medium" | "high";
}
