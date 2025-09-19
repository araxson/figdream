// Customer Portal Types
export type { Database } from '@/types/database.types'

// Re-export database types for customer domain
export type {
  Profile,
  Salon,
  Service,
  StaffProfile,
  Appointment,
  Review,
  CustomerFavorite as DatabaseCustomerFavorite,
  CustomerAnalytics,
  LoyaltyProgram as DatabaseLoyaltyProgram,
  AppointmentStatus,
  PaymentStatus,
  NotificationType,
  NotificationChannel,
} from '@/core/shared/types';

// Booking Flow Types
export interface BookingStep {
  id: string
  name: string
  completed: boolean
  current: boolean
}

export interface SalonSearchFilters {
  location?: string
  services?: string[]
  rating?: number
  distance?: number
  priceRange?: [number, number]
  availability?: Date
}

export interface SalonSearchResult {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  distance?: number
  rating_average: number
  rating_count: number
  price_range: string
  cover_image_url?: string
  logo_url?: string
  features: string[]
  is_accepting_bookings: boolean
  nextAvailableSlot?: Date
}

export interface ServiceSelectionItem {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  isSelected: boolean
  staffRequired?: string[]
  imageUrl?: string
  variants?: ServiceVariant[]
}

export interface ServiceVariant {
  id: string
  name: string
  description: string
  price: number
  duration: number
}

export interface StaffMember {
  id: string
  user_id: string
  name: string
  title: string
  bio: string
  specializations: string[]
  rating_average: number
  rating_count: number
  experience_years: number
  profile_image_url?: string
  portfolio_urls: string[]
  is_available: boolean
  nextAvailableSlot?: Date
  priceMultiplier?: number
}

export interface TimeSlot {
  date: Date
  time: string
  isAvailable: boolean
  staffId?: string
  price?: number
  duration: number
}

export interface BookingDetails {
  salon_id: string
  salon_name: string
  services: ServiceSelectionItem[]
  staff_id?: string
  staff_name?: string
  date: Date
  time: string
  duration: number
  total_amount: number
  notes?: string
  is_walk_in?: boolean
}

// Profile Management Types
// Use database Profile type as base, extend for UI needs
export type CustomerProfile = Profile & {
  // UI-specific computed fields
  full_name?: string;
  appointment_count?: number;
  last_appointment_date?: string;
};

export interface CustomerPreferences {
  language: string
  timezone: string
  communication: {
    email: boolean
    sms: boolean
    push: boolean
  }
  notifications: {
    bookingReminders: boolean
    promotions: boolean
    reviews: boolean
    cancellations: boolean
  }
  booking: {
    preferredTimeSlots: string[]
    preferredStaff: string[]
    notes?: string
  }
}

// Appointment History Types
// Use database Appointment type as base
export type AppointmentHistoryItem = Appointment & {
  // Related data for UI
  salon_name?: string;
  salon_logo_url?: string;
  staff_name?: string;
  staff_image_url?: string;
  services_info?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  }[];
  // UI state flags
  can_cancel?: boolean;
  can_reschedule?: boolean;
  can_review?: boolean;
  has_reviewed?: boolean;
};

// Favorites Types
// Extend database CustomerFavorite for UI
export type CustomerFavoriteItem = DatabaseCustomerFavorite & {
  // Related data for display
  item_name?: string;
  item_image_url?: string;
  salon_name?: string;
  rating?: number;
  last_visited?: string;
};

// Loyalty Program Types
export interface LoyaltyProgram {
  id: string
  salonId: string
  salonName: string
  name: string
  description: string
  type: 'points' | 'visits' | 'amount_spent'
  isActive: boolean
  rules: {
    pointsPerDollar?: number
    pointsPerVisit?: number
    bonusMultiplier?: number
    minimumSpend?: number
  }
  tiers: LoyaltyTier[]
  rewards: LoyaltyReward[]
}

export interface LoyaltyTier {
  id: string
  name: string
  minimumPoints: number
  benefits: string[]
  discountPercentage?: number
  color: string
}

export interface LoyaltyReward {
  id: string
  name: string
  description: string
  pointsCost: number
  type: 'discount' | 'free_service' | 'gift' | 'upgrade'
  value?: number
  applicableServices?: string[]
  imageUrl?: string
  termsAndConditions: string
  isActive: boolean
  expiresAt?: Date
}

export interface CustomerLoyalty {
  id: string
  customerId: string
  programId: string
  program: LoyaltyProgram
  currentPoints: number
  lifetimePoints: number
  currentTier: LoyaltyTier
  nextTier?: LoyaltyTier
  pointsToNextTier?: number
  joinedAt: Date
  lastActivityAt: Date
}

export interface LoyaltyTransaction {
  id: string
  customerId: string
  programId: string
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
  points: number
  description: string
  appointmentId?: string
  rewardId?: string
  referenceId?: string
  createdAt: Date
}

// Review System Types
// Use database Review type directly
export type CustomerReview = Review & {
  // Related data for display
  customer_name?: string;
  customer_image_url?: string;
  salon_name?: string;
  staff_name?: string;
  service_names?: string[];
  // UI computed fields
  helpful_votes?: number;
  total_votes?: number;
  visit_type?: 'first_time' | 'returning' | 'regular';
};

export interface ReviewSubmission {
  appointmentId: string
  salonId: string
  staffId?: string
  serviceIds: string[]
  overallRating: number
  ratings: {
    service: number
    staff: number
    atmosphere: number
    cleanliness: number
    value: number
  }
  title?: string
  comment: string
  photos?: File[]
  isRecommended: boolean
  tags?: string[]
  isAnonymous?: boolean
}

// Notification Types
// Notification type for customer interface
export interface CustomerNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  action_url?: string;
  action_text?: string;
  image_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_for?: string;
  expires_at?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  email: {
    bookingReminders: boolean
    bookingConfirmations: boolean
    cancellations: boolean
    promotions: boolean
    reviewRequests: boolean
    loyaltyUpdates: boolean
    newsletters: boolean
  }
  sms: {
    bookingReminders: boolean
    bookingConfirmations: boolean
    cancellations: boolean
    promotions: boolean
    urgentUpdates: boolean
  }
  push: {
    bookingReminders: boolean
    bookingConfirmations: boolean
    cancellations: boolean
    promotions: boolean
    reviewRequests: boolean
    loyaltyUpdates: boolean
    general: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
    timezone: string
  }
}

// Payment Types
export interface PaymentMethod {
  id: string
  userId: string
  type: 'card' | 'bank_account' | 'paypal' | 'other'
  isDefault: boolean
  lastFour?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Form Types
export interface BookingFormData {
  salon_id: string
  services: {
    id: string
    variant_id?: string
  }[]
  staff_id?: string
  date: string
  time: string
  notes?: string
  payment_method_id?: string
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export interface PreferencesFormData {
  language: string
  timezone: string
  communication: {
    email: boolean
    sms: boolean
    push: boolean
  }
  notifications: {
    bookingReminders: boolean
    promotions: boolean
    reviews: boolean
    cancellations: boolean
  }
  booking: {
    preferredTimeSlots: string[]
    preferredStaff: string[]
    notes?: string
  }
}

// API Response Types
export interface CustomerDashboardData {
  profile: CustomerProfile
  upcomingAppointments: AppointmentHistoryItem[]
  recentAppointments: AppointmentHistoryItem[]
  favorites: CustomerFavorite[]
  loyaltyPrograms: CustomerLoyalty[]
  notifications: Notification[]
  pendingReviews: AppointmentHistoryItem[]
}

export interface SalonBookingData {
  salon: SalonSearchResult
  services: ServiceSelectionItem[]
  staff: StaffMember[]
  availability: TimeSlot[]
  operatingHours: {
    [key: string]: {
      open: string
      close: string
      isClosed: boolean
    }
  }
}

// Error Types
export interface CustomerError {
  code: string
  message: string
  field?: string
  details?: Record<string, any>
}

// Loading States
export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

// Filter and Search Types
export interface AppointmentFilters {
  status?: ('scheduled' | 'confirmed' | 'completed' | 'cancelled')[]
  dateRange?: {
    start: Date
    end: Date
  }
  salonId?: string
  staffId?: string
  serviceId?: string
}

export interface ReviewFilters {
  rating?: number
  salonId?: string
  staffId?: string
  serviceId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  hasPhotos?: boolean
  isVerified?: boolean
}