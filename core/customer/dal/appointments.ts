import { createClient } from '@/lib/supabase/server'
import type { AppointmentHistoryItem, AppointmentFilters, PaginationState } from '../types'

export async function getCustomerAppointments(
  userId: string,
  filters: AppointmentFilters = {},
  pagination: Partial<PaginationState> = {}
): Promise<{
  appointments: AppointmentHistoryItem[]
  pagination: PaginationState
}> {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || user.id !== userId) {
    throw new Error('Unauthorized: Authentication required')
  }

  const page = pagination.page || 1
  const limit = pagination.limit || 10
  const offset = (page - 1) * limit

  let query = supabase
    .from('appointments')
    .select(`
      id,
      salon_id,
      staff_id,
      start_time,
      end_time,
      total_price,
      status,
      payment_status,
      notes,
      customer_notes,
      booking_type,
      created_at,
      updated_at,
      salons!inner(
        name,
        logo_url
      ),
      staff_profiles(
        profiles(first_name, last_name),
        profile_image_url
      ),
      appointment_services(
        service_id,
        price,
        duration_minutes,
        services(name)
      )
    `, { count: 'exact' })
    .eq('customer_id', userId)

  // Apply filters
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  if (filters.dateRange) {
    query = query
      .gte('start_time', filters.dateRange.start.toISOString())
      .lte('start_time', filters.dateRange.end.toISOString())
  }

  if (filters.salonId) {
    query = query.eq('salon_id', filters.salonId)
  }

  if (filters.staffId) {
    query = query.eq('staff_id', filters.staffId)
  }

  const { data, error, count } = await query
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`)
  }

  const appointments: AppointmentHistoryItem[] = data?.map(appointment => {
    const now = new Date()
    const startTime = new Date(appointment.start_time)
    const hoursUntilAppointment = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    const staffName = appointment.staff_profiles
      ? `${appointment.staff_profiles.profiles?.first_name || ''} ${appointment.staff_profiles.profiles?.last_name || ''}`.trim()
      : undefined

    return {
      id: appointment.id,
      salonId: appointment.salon_id,
      salonName: appointment.salons?.name || '',
      salonLogoUrl: appointment.salons?.logo_url,
      services: appointment.appointment_services?.map(service => ({
        id: service.service_id,
        name: service.services?.name || '',
        price: service.price,
        duration: service.duration_minutes
      })) || [],
      staffId: appointment.staff_id,
      staffName,
      staffImageUrl: appointment.staff_profiles?.profile_image_url,
      date: startTime,
      time: startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      duration: appointment.appointment_services?.reduce(
        (sum: number, service: any) => sum + service.duration_minutes,
        0
      ) || 0,
      totalPrice: appointment.total_price,
      status: appointment.status,
      paymentStatus: appointment.payment_status || 'pending',
      notes: appointment.notes,
      customerNotes: appointment.customer_notes,
      canCancel: ['scheduled', 'confirmed'].includes(appointment.status) && hoursUntilAppointment > 24,
      canReschedule: ['scheduled', 'confirmed'].includes(appointment.status) && hoursUntilAppointment > 24,
      canReview: appointment.status === 'completed',
      hasReviewed: false, // TODO: Check if review exists
      createdAt: new Date(appointment.created_at),
      updatedAt: new Date(appointment.updated_at)
    }
  }) || []

  return {
    appointments,
    pagination: {
      page,
      limit,
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    }
  }
}

export async function getUpcomingAppointments(userId: string): Promise<AppointmentHistoryItem[]> {
  const { appointments } = await getCustomerAppointments(
    userId,
    {
      status: ['scheduled', 'confirmed'],
      dateRange: {
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    },
    { limit: 5 }
  )

  return appointments
}

export async function getRecentAppointments(userId: string): Promise<AppointmentHistoryItem[]> {
  const { appointments } = await getCustomerAppointments(
    userId,
    {
      status: ['completed'],
      dateRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        end: new Date()
      }
    },
    { limit: 5 }
  )

  return appointments
}

export async function getAppointmentDetails(
  userId: string,
  appointmentId: string
): Promise<AppointmentHistoryItem | null> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      salon_id,
      staff_id,
      start_time,
      end_time,
      total_price,
      status,
      payment_status,
      notes,
      customer_notes,
      booking_type,
      created_at,
      updated_at,
      salons!inner(
        name,
        logo_url,
        address,
        phone,
        email
      ),
      staff_profiles(
        profiles(first_name, last_name),
        profile_image_url,
        title,
        bio
      ),
      appointment_services(
        service_id,
        price,
        duration_minutes,
        services(name, description)
      )
    `)
    .eq('id', appointmentId)
    .eq('customer_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  const now = new Date()
  const startTime = new Date(data.start_time)
  const hoursUntilAppointment = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  const staffName = data.staff_profiles
    ? `${data.staff_profiles.profiles?.first_name || ''} ${data.staff_profiles.profiles?.last_name || ''}`.trim()
    : undefined

  return {
    id: data.id,
    salonId: data.salon_id,
    salonName: data.salons?.name || '',
    salonLogoUrl: data.salons?.logo_url,
    services: data.appointment_services?.map(service => ({
      id: service.service_id,
      name: service.services?.name || '',
      price: service.price,
      duration: service.duration_minutes
    })) || [],
    staffId: data.staff_id,
    staffName,
    staffImageUrl: data.staff_profiles?.profile_image_url,
    date: startTime,
    time: startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    duration: data.appointment_services?.reduce(
      (sum: number, service: any) => sum + service.duration_minutes,
      0
    ) || 0,
    totalPrice: data.total_price,
    status: data.status,
    paymentStatus: data.payment_status || 'pending',
    notes: data.notes,
    customerNotes: data.customer_notes,
    canCancel: ['scheduled', 'confirmed'].includes(data.status) && hoursUntilAppointment > 24,
    canReschedule: ['scheduled', 'confirmed'].includes(data.status) && hoursUntilAppointment > 24,
    canReview: data.status === 'completed',
    hasReviewed: false, // TODO: Check if review exists
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function addAppointmentNotes(
  userId: string,
  appointmentId: string,
  notes: string
): Promise<void> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      customer_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .eq('customer_id', userId)

  if (error) {
    throw new Error(`Failed to add notes: ${error.message}`)
  }
}

export async function getAppointmentReceipt(
  userId: string,
  appointmentId: string
): Promise<{
  appointment: AppointmentHistoryItem
  billing: {
    subtotal: number
    tax: number
    total: number
    paymentMethod: string
    transactionId: string
  }
} | null> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Get appointment details
  const appointment = await getAppointmentDetails(userId, appointmentId)
  if (!appointment) {
    return null
  }

  // Get billing information
  const { data: billing, error: billingError } = await supabase
    .from('billing')
    .select(`
      amount,
      currency,
      status,
      stripe_payment_intent_id,
      payment_methods(type, brand, last_four)
    `)
    .eq('customer_id', userId)
    .limit(1)
    .single()

  if (billingError) {
    // Return appointment without billing if no billing record
    return {
      appointment,
      billing: {
        subtotal: appointment.totalPrice,
        tax: 0,
        total: appointment.totalPrice,
        paymentMethod: 'Cash',
        transactionId: ''
      }
    }
  }

  return {
    appointment,
    billing: {
      subtotal: appointment.totalPrice,
      tax: 0,
      total: billing.amount,
      paymentMethod: billing.payment_methods?.brand || billing.payment_methods?.type || 'Unknown',
      transactionId: billing.stripe_payment_intent_id || ''
    }
  }
}