/**
 * Loyalty Types - Database Schema
 *
 * Types that match the actual database schema
 */

import type { Database } from '@/types/database.types'

// Re-export database types for loyalty
export type LoyaltyProgram = Database['public']['Views']['loyalty_programs']['Row']
export type LoyaltyProgramInsert = Database['public']['Views']['loyalty_programs']['Insert']
export type LoyaltyProgramUpdate = Database['public']['Views']['loyalty_programs']['Update']

// Customer loyalty enrollment
export interface CustomerLoyalty {
  id: string;
  program_id: string;
  customer_id: string;
  customer?: Record<string, unknown>;
  points_balance: number;
  lifetime_points: number;
  visits_count: number;
  tier_level?: string;
  tier_achieved_at?: string;
  last_activity_at?: string;
  enrolled_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type CustomerLoyaltyInsert = Omit<
  CustomerLoyalty,
  "id" | "created_at" | "updated_at"
>;
export type CustomerLoyaltyUpdate = Partial<CustomerLoyaltyInsert>;

// Loyalty transactions
export interface LoyaltyTransaction {
  id: string;
  customer_loyalty_id: string;
  appointment_id?: string;
  transaction_type: string;
  points_amount: number;
  description: string;
  reference_id?: string;
  reference_type?: string;
  balance_after: number;
  expires_at?: string;
  created_at: string;
}

export type LoyaltyTransactionInsert = Omit<
  LoyaltyTransaction,
  "id" | "created_at"
>;

// Loyalty tiers
export interface LoyaltyTier {
  id: string;
  program_id: string;
  name: string;
  min_points: number;
  max_points?: number | null;
  benefits: string[];
  multiplier: number;
  created_at: string;
  updated_at: string;
}

export type LoyaltyTierInsert = Omit<
  LoyaltyTier,
  "id" | "created_at" | "updated_at"
>;
export type LoyaltyTierUpdate = Partial<LoyaltyTierInsert>;

// Enum types
export type LoyaltyProgramType = "points" | "visits" | "tiered" | "hybrid";
export type TransactionType =
  | "earned"
  | "redeemed"
  | "bonus"
  | "expired"
  | "adjustment_add"
  | "adjustment_subtract"
  | "transfer";
export type ReferenceType =
  | "appointment"
  | "purchase"
  | "referral"
  | "promotion"
  | "manual_adjustment"
  | "reward_redemption"
  | "points_expiry";

// Filter types
export interface LoyaltyProgramFilters {
  salonId?: string;
  isActive?: boolean;
  type?: LoyaltyProgramType;
}

export interface CustomerLoyaltyFilters {
  programId?: string;
  customerId?: string;
  tierLevel?: string;
  minPoints?: number;
  maxPoints?: number;
}

export interface LoyaltyTransactionFilters {
  customerLoyaltyId?: string;
  appointmentId?: string;
  type?: TransactionType;
  transactionType?: TransactionType;
  referenceType?: ReferenceType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Dashboard types
export interface LoyaltyDashboard {
  program: LoyaltyProgram | null;
  metrics: {
    totalMembers: number;
    activeMembers: number;
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    averagePointsBalance: number;
    topMembers: Array<{
      id: string;
      customer: Record<string, unknown>;
      lifetime_points: number;
      points_balance: number;
      tier_level?: string;
    }>;
  };
}

// Stats types
export interface LoyaltyStats {
  totalPrograms: number;
  activePrograms: number;
  totalEnrollments: number;
  activeEnrollments: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  averagePointsPerCustomer: number;
  topEarners: Array<{
    customerId: string;
    customerName: string;
    points: number;
  }>;
}

export interface CustomerLoyaltyStats {
  totalPrograms: number;
  totalPoints: number;
  totalRedeemed: number;
  totalEarned: number;
  currentTier?: string;
  nextTierProgress?: number;
  recentTransactions: LoyaltyTransaction[];
}

// Extended types
export interface CustomerLoyaltyDetails extends CustomerLoyalty {
  program?: LoyaltyProgram;
  recentTransactions?: LoyaltyTransaction[];
  nextTierProgress?: {
    currentTier: string;
    nextTier: string;
    pointsNeeded: number;
    progressPercentage: number;
  };
}

// Parameter types
export interface EarnPointsParams {
  customerLoyaltyId: string;
  appointmentId?: string;
  points: number;
  description: string;
  referenceType?: ReferenceType;
  referenceId?: string;
  expiresAt?: string;
}

export interface RedeemPointsParams {
  customerLoyaltyId: string;
  points: number;
  description: string;
  referenceType?: ReferenceType;
  referenceId?: string;
}

// Configuration types
export interface TierBenefit {
  name: string;
  description: string;
  value: number | string;
  type:
    | "discount"
    | "points_multiplier"
    | "free_service"
    | "priority_booking"
    | "custom";
}

export interface TierConfig {
  tiers: Array<{
    name: string;
    minPoints: number;
    maxPoints?: number;
    benefits: TierBenefit[];
    color?: string;
    icon?: string;
  }>;
}

// Form validation schemas using basic structure
export const CreateLoyaltyTierSchema = {
  name: { type: 'string', required: true },
  min_points: { type: 'number', required: true },
  benefits: { type: 'array', required: true },
  discount_percentage: { type: 'number', required: false }
};

export const UpdateLoyaltyTierSchema = {
  name: { type: 'string', required: false },
  min_points: { type: 'number', required: false },
  benefits: { type: 'array', required: false },
  discount_percentage: { type: 'number', required: false }
};
