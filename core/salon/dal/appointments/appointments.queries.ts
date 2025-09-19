import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import type {
  Appointment,
  AppointmentFilters,
  AppointmentStats,
} from "./appointments-types";

/**
 * Get appointments with optional filters
 */
export async function getAppointments(filters: AppointmentFilters = {}) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Optimize with proper joins to avoid N+1 queries
  let query = supabase
    .from("appointments")
    .select(`
      *,
      services!appointments_service_id_fkey (
        id,
        name,
        price,
        duration,
        category_id
      ),
      staff_profiles!appointments_staff_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      profiles!appointments_customer_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      salons!appointments_salon_id_fkey (
        id,
        name,
        slug
      )
    `)
    .order("start_time", { ascending: false });

  // Apply filters
  if (filters.salon_id) {
    query = query.eq("salon_id", filters.salon_id);
  }
  if (filters.staff_id) {
    query = query.eq("staff_id", filters.staff_id);
  }
  if (filters.customer_id) {
    query = query.eq("customer_id", filters.customer_id);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.payment_status) {
    query = query.eq("payment_status", filters.payment_status);
  }
  if (filters.start_date) {
    query = query.gte("start_time", filters.start_date);
  }
  if (filters.end_date) {
    query = query.lte("end_time", filters.end_date);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as Appointment[];
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Use cached query for single appointment lookups
  const getCachedAppointment = unstable_cache(
    async (appointmentId: string) => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          services!appointments_service_id_fkey (
            id,
            name,
            price,
            duration,
            category_id
          ),
          staff_profiles!appointments_staff_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          profiles!appointments_customer_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          salons!appointments_salon_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq("id", appointmentId)
        .single();

      if (error) throw error;
      return data;
    },
    ["appointment"],
    {
      revalidate: 60, // Cache for 1 minute
      tags: [`appointment-${id}`],
    }
  );

  return await getCachedAppointment(id) as Appointment;
}

/**
 * Get upcoming appointments for a customer
 */
export async function getUpcomingAppointments(customerId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      services!appointments_service_id_fkey (
        id,
        name,
        price,
        duration
      ),
      staff_profiles!appointments_staff_id_fkey (
        id,
        first_name,
        last_name
      ),
      salons!appointments_salon_id_fkey (
        id,
        name,
        slug
      )
    `)
    .eq("customer_id", customerId)
    .gte("start_time", now)
    .in("status", ["confirmed", "pending"])
    .order("start_time", { ascending: true })
    .limit(10);

  if (error) throw error;
  return (data || []) as unknown[];
}

/**
 * Get appointments for a specific date range
 */
export async function getAppointmentsByDateRange(
  startDate: string,
  endDate: string,
  salonId?: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("appointments")
    .select(`
      *,
      services!appointments_service_id_fkey (
        id,
        name,
        duration
      ),
      staff_profiles!appointments_staff_id_fkey (
        id,
        first_name,
        last_name
      ),
      profiles!appointments_customer_id_fkey (
        id,
        first_name,
        last_name
      )
    `)
    .gte("start_time", startDate)
    .lte("end_time", endDate)
    .order("start_time", { ascending: true });

  if (salonId) {
    query = query.eq("salon_id", salonId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as Appointment[];
}

/**
 * Get appointments for staff member
 */
export async function getStaffAppointments(
  staffId: string,
  filters: AppointmentFilters = {},
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("appointments")
    .select("*")
    .eq("staff_id", staffId)
    .order("start_time", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.start_date) {
    query = query.gte("start_time", filters.start_date);
  }
  if (filters.end_date) {
    query = query.lte("end_time", filters.end_date);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as Appointment[];
}

/**
 * Get customer appointment history
 */
export async function getCustomerAppointments(
  customerId: string,
  filters: AppointmentFilters = {},
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("appointments")
    .select("*")
    .eq("customer_id", customerId)
    .order("start_time", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.salon_id) {
    query = query.eq("salon_id", filters.salon_id);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as Appointment[];
}

/**
 * Get appointment statistics
 */
export async function getAppointmentStats(
  _salonId?: string,
): Promise<AppointmentStats> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // This is a placeholder implementation
  // In production, you'd aggregate data from the database
  return {
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
    upcomingToday: 0,
    completedToday: 0,
  };
}

/**
 * Check availability for a time slot
 */
export async function checkAvailability(
  staffId: string,
  startTime: string,
  endTime: string,
): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointments")
    .select("id")
    .eq("staff_id", staffId)
    .neq("status", "cancelled")
    .or(`start_time.gte.${startTime},end_time.lte.${endTime}`)
    .limit(1);

  if (error) throw error;
  return !data || data.length === 0;
}

/**
 * Get appointments by date (alias for getAppointmentsByDateRange)
 */
export async function getAppointmentsByDate(date: string, salonId?: string) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return getAppointmentsByDateRange(
    startOfDay.toISOString(),
    endOfDay.toISOString(),
    salonId,
  );
}

/**
 * Get customer upcoming appointments (alias for getUpcomingAppointments)
 */
export async function getCustomerUpcomingAppointments(customerId: string) {
  return getUpcomingAppointments(customerId);
}

/**
 * Get staff appointments for a specific day
 */
export async function getStaffDayAppointments(staffId: string, date: string) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return getStaffAppointments(staffId, {
    start_date: startOfDay.toISOString(),
    end_date: endOfDay.toISOString(),
  });
}
