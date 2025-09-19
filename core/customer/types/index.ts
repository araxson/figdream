// Customer Portal Types
export type { Database } from '@/types/database.types'

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
  shortDescription: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  distance?: number
  rating: number
  reviewCount: number
  priceRange: string
  coverImageUrl?: string
  logoUrl?: string
  features: string[]
  isBookingAvailable: boolean
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
  userId: string
  name: string
  title: string
  bio: string
  specializations: string[]
  rating: number
  reviewCount: number
  experienceYears: number
  profileImageUrl?: string
  portfolioUrls: string[]
  isAvailable: boolean
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
  salonId: string
  salonName: string
  services: ServiceSelectionItem[]
  staffId?: string
  staffName?: string
  date: Date
  time: string
  duration: number
  totalPrice: number
  notes?: string
  isWalkIn?: boolean
}

// Profile Management Types
export interface CustomerProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: Date
  profileImageUrl?: string
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  preferences: CustomerPreferences
  createdAt: Date
  updatedAt: Date
}

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
export interface AppointmentHistoryItem {
  id: string
  salonId: string
  salonName: string
  salonLogoUrl?: string
  services: {
    id: string
    name: string
    price: number
    duration: number
  }[]
  staffId?: string
  staffName?: string
  staffImageUrl?: string
  date: Date
  time: string
  duration: number
  totalPrice: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  notes?: string
  customerNotes?: string
  photos?: string[]
  receiptUrl?: string
  canCancel: boolean
  canReschedule: boolean
  canReview: boolean
  hasReviewed: boolean
  createdAt: Date
  updatedAt: Date
}

// Favorites Types
export interface CustomerFavorite {
  id: string
  customerId: string
  type: 'salon' | 'staff' | 'service'
  itemId: string
  itemName: string
  itemImageUrl?: string
  salonId?: string
  salonName?: string
  rating?: number
  lastVisited?: Date
  notes?: string
  createdAt: Date
}

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
export interface Review {
  id: string
  customerId: string
  customerName: string
  customerImageUrl?: string
  salonId: string
  salonName: string
  appointmentId?: string
  staffId?: string
  staffName?: string
  serviceIds: string[]
  serviceNames: string[]
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
  photos: string[]
  isRecommended: boolean
  isVerified: boolean
  helpfulVotes: number
  totalVotes: number
  salonResponse?: {
    message: string
    respondedAt: Date
    responderName: string
  }
  tags: string[]
  visitType: 'first_time' | 'returning' | 'regular'
  createdAt: Date
  updatedAt: Date
}

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
export interface Notification {
  id: string
  userId: string
  type: 'booking_reminder' | 'booking_confirmation' | 'cancellation' | 'promotion' | 'review_request' | 'loyalty_update' | 'general'
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  actionUrl?: string
  actionText?: string
  imageUrl?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledFor?: Date
  expiresAt?: Date
  createdAt: Date
  readAt?: Date
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
  salonId: string
  services: {
    id: string
    variantId?: string
  }[]
  staffId?: string
  date: string
  time: string
  notes?: string
  paymentMethodId?: string
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