/**
 * Salons Module Types
 */

// Re-export all types from DAL
export * from "./dal/salons-types";

// Import specific types for component usage
import type {
  SalonWithRelations,
  BusinessType,
  DayOfWeek,
} from "./dal/salons-types";

// Component-specific types
export interface SalonCardProps {
  salon: SalonWithRelations;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleFeatured?: (id: string) => void;
  onToggleBooking?: (id: string) => void;
  showActions?: boolean;
}

export interface SalonListProps {
  salons: SalonWithRelations[];
  loading?: boolean;
  onActionComplete?: () => void;
}

export interface SalonFormData {
  name: string;
  business_name?: string;
  business_type?: BusinessType;
  email: string;
  phone: string;
  website?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  description?: string;
  timezone?: string;
  currency_code?: string;
}

export type OperatingHoursFormData = {
  [key in DayOfWeek]: {
    is_closed: boolean;
    open_time?: string;
    close_time?: string;
    break_start?: string;
    break_end?: string;
  };
};
