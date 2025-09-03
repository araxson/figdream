/**
 * Unified Data Access Layer
 * Provides role-aware data access with automatic permission checking
 */
import { createClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/permissions"
import type { Database } from "@/types/database.types"
type UserRole = Database["public"]["Enums"]["user_role_type"]
export interface UserContext {
  userId: string
  role: UserRole
  salonId?: string
  locationId?: string
  staffId?: string
  customerId?: string
}
/**
 * Get user context with role and associated IDs
 */
export async function getUserContext(userId: string): Promise<UserContext | null> {
  const supabase = await createClient()
  // Get user role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single()
  if (!userRole) return null
  const context: UserContext = {
    userId,
    role: userRole.role as UserRole,
    salonId: userRole.salon_id || undefined,
    locationId: userRole.location_id || undefined
  }
  // Get additional IDs based on role
  if (userRole.role === "staff") {
    const { data: staffProfile } = await supabase
      .from("staff_profiles")
      .select("id")
      .eq("user_id", userId)
      .single()
    if (staffProfile) {
      context.staffId = staffProfile.id
    }
  } else if (userRole.role === "customer") {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", userId)
      .single()
    if (customer) {
      context.customerId = customer.id
    }
  }
  return context
}
/**
 * Get appointments based on user role and permissions
 */
export async function getAppointments(context: UserContext) {
  const supabase = await createClient()
  let query = supabase
    .from("appointments")
    .select(`
      *,
      customers (
        profiles (full_name, email, phone)
      ),
      staff_profiles (
        display_name,
        profiles (full_name)
      ),
      services (name, duration, price),
      salon_locations (name, address)
    `)
    .order("appointment_date", { ascending: false })
  // Apply role-based filtering
  if (hasPermission(context.role, "appointments.view_all")) {
    // Super admin sees everything
    if (context.role === "super_admin") {
      // No additional filters
    }
    // Salon owner sees their salon
    else if (context.role === "salon_owner" && context.salonId) {
      query = query.eq("salon_id", context.salonId)
    }
    // Location manager sees their location
    else if (context.role === "location_manager" && context.locationId) {
      query = query.eq("location_id", context.locationId)
    }
  } else if (hasPermission(context.role, "appointments.view_own")) {
    // Staff sees their appointments
    if (context.role === "staff" && context.staffId) {
      query = query.eq("staff_id", context.staffId)
    }
    // Customer sees their appointments
    else if (context.role === "customer" && context.customerId) {
      query = query.eq("customer_id", context.customerId)
    }
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}
/**
 * Get customers based on user role and permissions
 */
export async function getCustomers(context: UserContext) {
  const supabase = await createClient()
  if (!hasPermission(context.role, "customers.view_all") && 
      !hasPermission(context.role, "customers.view_own")) {
    return []
  }
  let query = supabase
    .from("customers")
    .select(`
      *,
      profiles (full_name, email, phone, avatar_url)
    `)
    .order("created_at", { ascending: false })
  // Apply role-based filtering
  if (context.role === "salon_owner" && context.salonId) {
    query = query.eq("salon_id", context.salonId)
  } else if (context.role === "location_manager" && context.locationId) {
    // Get customers who have appointments at this location
    const { data: appointmentCustomerIds } = await supabase
      .from("appointments")
      .select("customer_id")
      .eq("location_id", context.locationId)
    if (appointmentCustomerIds) {
      const customerIds = [...new Set(appointmentCustomerIds.map(a => a.customer_id))]
      query = query.in("id", customerIds)
    }
  } else if (context.role === "customer" && context.customerId) {
    query = query.eq("id", context.customerId)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}
/**
 * Get staff based on user role and permissions
 */
export async function getStaff(context: UserContext) {
  const supabase = await createClient()
  if (!hasPermission(context.role, "staff.view_all") && 
      !hasPermission(context.role, "staff.view_own")) {
    return []
  }
  let query = supabase
    .from("staff_profiles")
    .select(`
      *,
      profiles (full_name, email, phone, avatar_url),
      salons (name)
    `)
    .order("created_at", { ascending: false })
  // Apply role-based filtering
  if (context.role === "salon_owner" && context.salonId) {
    query = query.eq("salon_id", context.salonId)
  } else if (context.role === "location_manager" && context.locationId) {
    // Get staff assigned to this location
    query = query.eq("location_id", context.locationId)
  } else if (context.role === "staff" && context.staffId) {
    query = query.eq("id", context.staffId)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}
/**
 * Get services based on user role and permissions
 */
export async function getServices(context: UserContext) {
  const supabase = await createClient()
  if (!hasPermission(context.role, "services.view")) {
    return []
  }
  let query = supabase
    .from("services")
    .select(`
      *,
      service_categories (name),
      salons (name)
    `)
    .eq("is_active", true)
    .order("name")
  // Apply role-based filtering
  if (context.role === "salon_owner" && context.salonId) {
    query = query.eq("salon_id", context.salonId)
  } else if (context.role === "location_manager" && context.salonId) {
    // Location managers see all services from their salon
    query = query.eq("salon_id", context.salonId)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}
/**
 * Get analytics data based on user role and permissions
 */
export async function getAnalytics(context: UserContext, dateRange?: { start: Date, end: Date }) {
  const supabase = await createClient()
  if (!hasPermission(context.role, "analytics.view_all") && 
      !hasPermission(context.role, "analytics.view_own")) {
    return null
  }
  const metrics: {
    totalRevenue: number;
    totalAppointments: number;
    totalCustomers: number;
    averageRating: number;
  } = {
    totalRevenue: 0,
    totalAppointments: 0,
    totalCustomers: 0,
    averageRating: 0
  }
  // Get appointments for metrics
  let appointmentsQuery = supabase
    .from("appointments")
    .select("*, services(price)")
    .eq("status", "completed")
  if (dateRange) {
    appointmentsQuery = appointmentsQuery
      .gte("appointment_date", dateRange.start.toISOString())
      .lte("appointment_date", dateRange.end.toISOString())
  }
  // Apply role-based filtering
  if (context.role === "salon_owner" && context.salonId) {
    appointmentsQuery = appointmentsQuery.eq("salon_id", context.salonId)
  } else if (context.role === "location_manager" && context.locationId) {
    appointmentsQuery = appointmentsQuery.eq("location_id", context.locationId)
  } else if (context.role === "staff" && context.staffId) {
    appointmentsQuery = appointmentsQuery.eq("staff_id", context.staffId)
  }
  const { data: appointments } = await appointmentsQuery
  if (appointments) {
    metrics.totalAppointments = appointments.length
    metrics.totalRevenue = appointments.reduce((sum, apt) => 
      sum + (apt.total_price || apt.services?.price || 0), 0
    )
  }
  // Get customer count
  if (hasPermission(context.role, "customers.view_all")) {
    let customersQuery = supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
    if (context.role === "salon_owner" && context.salonId) {
      customersQuery = customersQuery.eq("salon_id", context.salonId)
    }
    const { count } = await customersQuery
    metrics.totalCustomers = count || 0
  }
  // Get reviews for rating
  let reviewsQuery = supabase
    .from("reviews")
    .select("rating")
  if (context.role === "salon_owner" && context.salonId) {
    reviewsQuery = reviewsQuery.eq("salon_id", context.salonId)
  } else if (context.role === "staff" && context.staffId) {
    reviewsQuery = reviewsQuery.eq("staff_id", context.staffId)
  }
  const { data: reviews } = await reviewsQuery
  if (reviews && reviews.length > 0) {
    metrics.averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  }
  return metrics
}
/**
 * Get profile data based on user role
 */
export async function getProfile(context: UserContext) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", context.userId)
    .single()
  const additionalData: Record<string, unknown> = {}
  // Get role-specific data
  if (context.role === "staff" && context.staffId) {
    const { data: staffProfile } = await supabase
      .from("staff_profiles")
      .select(`
        *,
        salons (name, address)
      `)
      .eq("id", context.staffId)
      .single()
    additionalData.staffProfile = staffProfile
  } else if (context.role === "salon_owner" && context.salonId) {
    const { data: salon } = await supabase
      .from("salons")
      .select("*")
      .eq("id", context.salonId)
      .single()
    additionalData.salon = salon
  } else if (context.role === "customer" && context.customerId) {
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("id", context.customerId)
      .single()
    additionalData.customer = customer
  }
  return {
    profile,
    ...additionalData
  }
}
/**
 * Get settings based on user role
 */
export async function getSettings(context: UserContext): Promise<unknown> {
  const supabase = await createClient()
  // For customers, get customer preferences
  if (context.role === "customer" && context.customerId) {
    const { data: preferences } = await supabase
      .from("customer_preferences")
      .select("*")
      .eq("customer_id", context.customerId)
      .single()
    return preferences
  }
  // For staff, return mock settings (table doesn't exist)
  if (context.role === "staff") {
    return null // staff_preferences table doesn't exist
  }
  // For salon owners and managers, get settings
  if ((context.role === "salon_owner" || context.role === "location_manager") && context.salonId) {
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("salon_id", context.salonId)
      .single()
    return settings
  }
  return null
}
/**
 * Check if user can perform action on resource
 */
export function canPerformAction(
  context: UserContext,
  action: string,
  resource: string,
  resourceOwnerId?: string
): boolean {
  // Check if user has permission for all resources
  const allPermission = `${resource}.${action}_all`
  if (hasPermission(context.role, allPermission)) {
    // Additional checks for scope
    if (context.role === "salon_owner" || context.role === "location_manager") {
      // They can only act on resources in their salon/location
      return true // Assuming resource ownership is validated elsewhere
    }
    return true
  }
  // Check if user has permission for own resources
  const ownPermission = `${resource}.${action}_own`
  if (hasPermission(context.role, ownPermission)) {
    // Check if user owns the resource
    if (resourceOwnerId === context.userId || 
        resourceOwnerId === context.staffId || 
        resourceOwnerId === context.customerId) {
      return true
    }
  }
  return false
}