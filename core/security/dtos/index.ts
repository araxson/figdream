/**
 * SECURITY GUARDIAN PLUS - Secure Data Transfer Objects (DTOs)
 *
 * Type-safe DTOs that strip sensitive information from database entities
 * before returning to clients. These DTOs ensure no sensitive data leakage.
 */

import type { Database } from "@/types/database.types";

// Extract base types from database
type Tables = Database["public"]["Tables"];
type AppointmentRow = Tables["appointments"]["Row"];
type ProfileRow = Tables["profiles"]["Row"];
type SalonRow = Tables["salons"]["Row"];
type StaffProfileRow = Tables["staff_profiles"]["Row"];
type ServiceRow = Tables["services"]["Row"];
type BillingRow = Tables["billing"]["Row"];

/**
 * User/Profile DTOs - Strip sensitive authentication data
 */
export interface UserProfileDTO {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  // Excluded: password_hash, auth_id, internal_notes, etc.
}

export interface PublicProfileDTO {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  // Minimal public information only
}

/**
 * Appointment DTOs - Control visibility based on user role
 */
export interface AppointmentDTO {
  id: string;
  salonId: string;
  customerId: string;
  staffId: string;
  serviceId: string | null;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number | null;
  confirmationCode: string | null;
  notes: string | null; // Only if user has permission
  createdAt: string;
  // Relations
  service?: ServiceBasicDTO;
  staff?: StaffBasicDTO;
  customer?: PublicProfileDTO;
  salon?: SalonBasicDTO;
  // Excluded: internal_notes, payment_details (unless authorized)
}

export interface AppointmentListDTO {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  serviceName: string | null;
  staffName: string | null;
  customerName: string | null;
  totalPrice: number | null;
}

export interface AppointmentCreateDTO {
  salonId: string;
  staffId: string;
  serviceId: string;
  startTime: string;
  duration: number;
  notes?: string;
  // customerId is set from session, not user input
}

/**
 * Salon DTOs - Different levels of detail
 */
export interface SalonPublicDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  isAcceptingBookings: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  rating: number | null;
  reviewCount: number;
  // Excluded: owner_id, tax_id, bank_account, internal data
}

export interface SalonManagementDTO extends SalonPublicDTO {
  ownerId: string;
  businessName: string | null;
  taxId: string | null; // Only for owner/admin
  timezone: string;
  currency: string;
  subscriptionTier: string | null;
  monthlyRevenue: number | null; // Only for owner/admin
  staffCount: number;
  serviceCount: number;
  createdAt: string;
  updatedAt: string | null;
  // Still excluded: bank_account, api_keys, etc.
}

export interface SalonBasicDTO {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

/**
 * Staff DTOs - Professional information only
 */
export interface StaffPublicDTO {
  id: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  specialties: string[] | null;
  rating: number | null;
  isBookable: boolean;
  isFeatured: boolean;
  // Excluded: personal email, phone, salary, SSN, etc.
}

export interface StaffManagementDTO extends StaffPublicDTO {
  email: string | null; // Only for managers
  phone: string | null; // Only for managers
  employmentType: string;
  status: string;
  startDate: string | null;
  commissionRate: number | null; // Only for owner/admin
  baseSalary: number | null; // Only for owner/admin
  createdAt: string;
  // Still excluded: SSN, emergency contacts, bank info
}

export interface StaffBasicDTO {
  id: string;
  displayName: string;
  title: string | null;
  avatarUrl: string | null;
}

/**
 * Service DTOs - Pricing and availability
 */
export interface ServiceDTO {
  id: string;
  salonId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  isActive: boolean;
  isFeatured: boolean;
  requiresDeposit: boolean;
  depositAmount: number | null;
  maxAdvanceBookingDays: number | null;
  category?: ServiceCategoryDTO;
  // Excluded: cost, margin, internal pricing data
}

export interface ServiceBasicDTO {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface ServiceCategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

/**
 * Billing DTOs - Financial data with strict access control
 */
export interface BillingCustomerDTO {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
  // Very limited info for customers
}

export interface BillingManagementDTO {
  id: string;
  salonId: string;
  customerId: string | null;
  appointmentId: string | null;
  amount: number;
  status: string;
  description: string | null;
  paymentMethod: string | null;
  transactionId: string | null; // Partial/masked
  createdAt: string;
  processedAt: string | null;
  // Excluded: full card numbers, bank accounts, etc.
}

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  items: InvoiceItemDTO[];
  // Customer info
  customer?: PublicProfileDTO;
}

export interface InvoiceItemDTO {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Analytics DTOs - Aggregated data only
 */
export interface RevenueAnalyticsDTO {
  period: string;
  revenue: number;
  appointmentCount: number;
  averageTicket: number;
  // No individual transaction details
}

export interface StaffPerformanceDTO {
  staffId: string;
  staffName: string;
  period: string;
  appointmentCount: number;
  revenue: number;
  rating: number | null;
  utilization: number;
  // No individual client or pricing details
}

export interface CustomerInsightsDTO {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageLifetimeValue: number;
  churnRate: number;
  // No individual customer data
}

/**
 * Notification DTOs - Sanitized content
 */
export interface NotificationDTO {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  // Excluded: internal metadata, tracking data
}

/**
 * Review DTOs - Public feedback
 */
export interface ReviewDTO {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  // Relations
  customer?: PublicProfileDTO;
  staff?: StaffBasicDTO;
  service?: ServiceBasicDTO;
  response?: ReviewResponseDTO;
  // Excluded: IP address, device info, etc.
}

export interface ReviewResponseDTO {
  id: string;
  message: string;
  respondedAt: string;
  respondedBy?: PublicProfileDTO;
}

/**
 * Helper function to create DTOs from database rows
 */
export function createAppointmentDTO(
  appointment: AppointmentRow,
  includePrivateNotes: boolean = false
): AppointmentDTO {
  return {
    id: appointment.id,
    salonId: appointment.salon_id,
    customerId: appointment.customer_id,
    staffId: appointment.staff_id,
    serviceId: appointment.service_id,
    startTime: appointment.start_time,
    endTime: appointment.end_time,
    status: appointment.status,
    totalPrice: appointment.total_price,
    confirmationCode: appointment.confirmation_code,
    notes: includePrivateNotes ? appointment.notes : null,
    createdAt: appointment.created_at
  };
}

export function createUserProfileDTO(profile: ProfileRow): UserProfileDTO {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    phone: profile.phone,
    role: profile.role || "customer",
    createdAt: profile.created_at
  };
}

export function createPublicProfileDTO(profile: ProfileRow): PublicProfileDTO {
  return {
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url
  };
}

export function createSalonPublicDTO(salon: SalonRow): SalonPublicDTO {
  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    description: salon.description,
    logoUrl: salon.logo_url,
    coverImageUrl: salon.cover_image_url,
    address: salon.address,
    city: salon.city,
    state: salon.state,
    zipCode: salon.zip_code,
    country: salon.country,
    phone: salon.phone,
    email: salon.email,
    website: salon.website,
    isActive: salon.is_active,
    isAcceptingBookings: salon.is_accepting_bookings,
    isFeatured: salon.is_featured || false,
    isVerified: salon.is_verified || false,
    rating: salon.average_rating,
    reviewCount: salon.total_reviews || 0
  };
}

export function createStaffPublicDTO(staff: StaffProfileRow): StaffPublicDTO {
  return {
    id: staff.id,
    displayName: staff.display_name || `${staff.first_name} ${staff.last_name}`,
    title: staff.title,
    bio: staff.bio,
    avatarUrl: staff.avatar_url,
    specialties: staff.specialties,
    rating: staff.average_rating,
    isBookable: staff.is_bookable,
    isFeatured: staff.is_featured || false
  };
}

/**
 * Export all DTOs and helpers
 */
export const SecureDTOs = {
  // Creation helpers
  createAppointmentDTO,
  createUserProfileDTO,
  createPublicProfileDTO,
  createSalonPublicDTO,
  createStaffPublicDTO
};

export default SecureDTOs;